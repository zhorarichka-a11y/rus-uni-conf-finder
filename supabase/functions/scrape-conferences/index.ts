import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting conference scraping...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Получаем активные источники
    const { data: sources, error: sourcesError } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      throw sourcesError;
    }

    console.log(`Found ${sources?.length || 0} active sources`);

    const scrapedConferences = [];

    for (const source of sources || []) {
      console.log(`Processing ${source.name}...`);
      
      try {
        // Fetch page with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(source.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.log(`Failed to fetch ${source.url}: ${response.status}`);
          continue;
        }

        const html = await response.text();
        console.log(`Fetched ${html.length} bytes from ${source.name}`);

        // Limit HTML size to avoid token limits
        const truncatedHtml = html.substring(0, 30000);

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `Ты помощник для извлечения информации о научных конференциях из HTML страниц российских транспортных университетов. Текущая дата: ${new Date().toISOString().split('T')[0]}. Извлекай ТОЛЬКО предстоящие конференции с датами в будущем.`
              },
              {
                role: 'user',
                content: `Проанализируй HTML и извлеки информацию о предстоящих научных конференциях.

Для каждой конференции верни:
- title: название конференции
- date: дата начала (YYYY-MM-DD)
- end_date: дата окончания (YYYY-MM-DD, если указана)
- location: город или место проведения
- description: краткое описание (1-2 предложения)
- format: "Очно", "Онлайн" или "Гибридный"
- topic: тема (выбери из: "Железнодорожный транспорт", "Автомобильный транспорт", "Логистика", "Цифровые технологии", "Экология", "Транспортные системы")
- registration_url: ссылка на регистрацию
- venue: адрес или здание проведения
- fee: стоимость участия

Если информации нет — пропусти это поле. Верни только конференции с датой >= ${new Date().toISOString().split('T')[0]}.

HTML:
${truncatedHtml}`
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "extract_conferences",
                description: "Extract conference information",
                parameters: {
                  type: "object",
                  properties: {
                    conferences: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          date: { type: "string" },
                          end_date: { type: "string" },
                          location: { type: "string" },
                          description: { type: "string" },
                          format: { type: "string" },
                          topic: { type: "string" },
                          registration_url: { type: "string" },
                          venue: { type: "string" },
                          fee: { type: "string" }
                        },
                        required: ["title", "date", "location", "description", "format", "topic"]
                      }
                    }
                  },
                  required: ["conferences"]
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "extract_conferences" } }
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI API error for ${source.name}:`, aiResponse.status, errorText);
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall && toolCall.function.arguments) {
          const extracted = JSON.parse(toolCall.function.arguments);
          const conferences = extracted.conferences || [];
          
          for (const conf of conferences) {
            // Validate date
            if (!conf.date || !/^\d{4}-\d{2}-\d{2}$/.test(conf.date)) {
              console.log(`Skipping conference with invalid date: ${conf.title}`);
              continue;
            }
            
            scrapedConferences.push({
              title: conf.title,
              date: conf.date,
              end_date: conf.end_date || null,
              location: conf.location || source.name,
              description: conf.description || '',
              format: conf.format || 'Очно',
              topic: conf.topic || 'Транспортные системы',
              registration_url: conf.registration_url || null,
              venue: conf.venue || null,
              fee: conf.fee || null,
              university: source.name,
              source_url: source.url
            });
          }
          
          console.log(`Extracted ${conferences.length} conferences from ${source.name}`);
        }

        // Update last scraped time
        await supabase
          .from('scraping_sources')
          .update({ last_scraped_at: new Date().toISOString() })
          .eq('id', source.id);

      } catch (error) {
        console.error(`Error processing ${source.name}:`, error);
      }
    }

    // Insert conferences if any found
    if (scrapedConferences.length > 0) {
      console.log(`Inserting ${scrapedConferences.length} conferences...`);
      
      const { error: insertError } = await supabase
        .from('conferences')
        .upsert(scrapedConferences, { 
          onConflict: 'title,university,date',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Error inserting conferences:', insertError);
      }
    }

    console.log('Scraping completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        scraped: scrapedConferences.length,
        sources: sources?.length || 0,
        conferences: scrapedConferences
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-conferences function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

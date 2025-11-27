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

    // Получаем активные источники для парсинга
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
      console.log(`Scraping ${source.name}...`);
      
      try {
        // Получаем HTML страницы
        const response = await fetch(source.url);
        const html = await response.text();

        // Используем Lovable AI для извлечения информации о конференциях
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
                content: 'Ты помощник для извлечения информации о конференциях из HTML. Извлекай только предстоящие конференции, связанные с транспортом.'
              },
              {
                role: 'user',
                content: `Извлеки информацию о конференциях из следующего HTML. Для каждой конференции верни объект со следующими полями:
- title (название конференции)
- date (дата начала в формате YYYY-MM-DD)
- end_date (дата окончания в формате YYYY-MM-DD, если есть)
- location (место проведения)
- description (описание)
- format (формат: "Очно", "Онлайн" или "Гибридный")
- topic (тема из списка: "Железнодорожный транспорт", "Автомобильный транспорт", "Водный транспорт", "Авиационный транспорт", "Логистика", "Цифровые технологии", "Экология")
- registration_url (ссылка на регистрацию, если есть)
- registration_deadline (дедлайн регистрации в формате YYYY-MM-DD, если есть)
- contact_email (email для контактов, если есть)
- contact_phone (телефон для контактов, если есть)
- venue (место проведения/адрес, если есть)
- fee (стоимость участия, если есть)

Верни только предстоящие конференции (дата >= сегодня). Формат ответа: JSON массив объектов.

HTML:
${html.substring(0, 50000)}`
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "extract_conferences",
                description: "Extract conference information from HTML",
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
                          format: { type: "string", enum: ["Очно", "Онлайн", "Гибридный"] },
                          topic: { type: "string" },
                          registration_url: { type: "string" },
                          registration_deadline: { type: "string" },
                          contact_email: { type: "string" },
                          contact_phone: { type: "string" },
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
            scrapedConferences.push({
              ...conf,
              university: source.name,
              source_url: source.url
            });
          }
          
          console.log(`Extracted ${conferences.length} conferences from ${source.name}`);
        }

        // Обновляем время последнего парсинга
        await supabase
          .from('scraping_sources')
          .update({ last_scraped_at: new Date().toISOString() })
          .eq('id', source.id);

      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error);
      }
    }

    // Сохраняем найденные конференции
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
        throw insertError;
      }
    }

    console.log('Scraping completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        scraped: scrapedConferences.length,
        message: `Успешно обработано ${scrapedConferences.length} конференций`
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
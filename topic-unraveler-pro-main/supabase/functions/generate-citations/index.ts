import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, style, fileContent, fileName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let userPrompt = `Generate properly formatted citations in ${style} style for research on: ${topic}`;
    
    if (fileContent) {
      userPrompt = `File uploaded: ${fileName}\n\nFile content:\n${fileContent}\n\nExtract key findings from this file, provide a one-paragraph summary, suggest one chart type for the data, and generate ${style} style citations.`;
    }

    const systemPrompt = `You are an AI Research Assistant that provides credible references and citation formatting.

When given a research topic, generate 4-6 properly formatted academic citations in the requested style (APA/MLA/Chicago).

When given an uploaded file (PDF/CSV/TXT):
- Extract key findings and summarize them in one clean paragraph
- Suggest ONE specific chart type suitable for visualizing the data
- Provide formatted citations for the document

Return the response as a valid JSON object with this structure:
{
  "citations": [{"reference": "string", "style": "string"}],
  "summary": "string (only if file uploaded)",
  "chartSuggestion": "string (only if file uploaded)"
}

Keep citations professional and accurate. For file analysis, be concise and actionable.`;

    console.log('Calling Lovable AI for citations...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Response:', content);
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-citations function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

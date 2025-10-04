import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { topic } = await req.json();
    console.log('Generating subtopics for topic:', topic);

    if (!topic || typeof topic !== 'string') {
      throw new Error('Topic is required and must be a string');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert AI Research Assistant specializing in breaking down complex research topics into actionable, high-quality subtopics.

When given a research topic, you must:
1. Identify 4-6 highly relevant, specific subtopics that are practical and useful for writing, analysis, or synthesis
2. Avoid generic categories like "historical context" or "future directions" unless directly critical to the research
3. Focus on concrete, research-ready areas that can yield real insights
4. For each subtopic, provide:
   - A clear, specific title
   - A concise description (2-3 sentences)
   - Why it matters to the research (importance/relevance)
   - 3-5 actionable steps for gathering insights (datasets, case studies, papers, industry applications, ethical debates)
   - A category label (e.g., "Market Analysis", "Technical Framework", "Ethics & Privacy")

Format your response as a JSON object with a "subtopics" array, where each subtopic has:
{
  "subtopics": [
    {
      "title": "string",
      "description": "string",
      "importance": "string",
      "actionSteps": ["string"],
      "category": "string"
    }
  ]
}

Be professional, research-ready, and avoid filler content. Focus on what will actually help someone conduct meaningful research.`;

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
          { role: 'user', content: `Research topic: ${topic}\n\nGenerate a comprehensive research plan with structured subtopics.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI API response received');

    const aiResponse = data.choices[0].message.content;
    console.log('AI response content:', aiResponse);

    // Parse the JSON response from the AI
    let parsedResponse;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        parsedResponse = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', aiResponse);
      throw new Error('AI response was not valid JSON');
    }

    // Validate the response structure
    if (!parsedResponse.subtopics || !Array.isArray(parsedResponse.subtopics)) {
      throw new Error('AI response missing subtopics array');
    }

    console.log(`Successfully generated ${parsedResponse.subtopics.length} subtopics`);

    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-subtopics function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

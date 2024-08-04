// app/api/generate-recipe/route.js
import OpenAI from 'openai';
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey
});

export async function POST(request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            console.error("No prompt provided");
            return new Response(JSON.stringify({ error: 'Invalid prompt' }), { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or 'gpt-4'
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 200,
        });

        const recipe = response.choices[0].message.content.trim();
        return new Response(JSON.stringify({ recipes: [recipe] }), { status: 200 });
    } catch (error) {
        console.error("Error generating recipe:", error);
        return new Response(JSON.stringify({ error: 'Error generating recipe' }), { status: 500 });
    }
}

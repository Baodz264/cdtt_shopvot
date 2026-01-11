<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        // Validate input
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->message;

        // Lấy API Key từ env
        $apiKey = env('OPENAI_API_KEY');
        $model  = env('OPENAI_MODEL', 'gpt-3.5-turbo'); // hoặc 'gpt-4' nếu có key Pro

        $payload = [
            "model" => $model,
            "messages" => [
                [
                    "role" => "user",
                    "content" => $userMessage
                ]
            ],
            "temperature" => 0.7,
            "max_tokens" => 500
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey,
            ])->post('https://api.openai.com/v1/chat/completions', $payload);

            if ($response->failed()) {
                return response()->json([
                    'message' => 'Gọi API ChatGPT thất bại',
                    'errors' => $response->body()
                ], 500);
            }

            $result = $response->json();

            // Lấy reply từ ChatGPT
            $reply = $result['choices'][0]['message']['content'] ?? 'Không có phản hồi';

            return response()->json([
                'reply' => $reply
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi gọi API ChatGPT',
                'errors' => $e->getMessage()
            ], 500);
        }
    }
}

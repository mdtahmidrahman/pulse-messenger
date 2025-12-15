<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sender_id' =>$senderId,
            'receiver_id' => $receiverId,
            'group_id'=> $groupId,
            'message' => $this -> faker -> realText(200),
            'created_at'=> $this -> faker -> dateTimeBetween('-1 year','now'),
             
        ];
    }
}

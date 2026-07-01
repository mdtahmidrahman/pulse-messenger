<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'message' => 'nullable|string',
            'group_id' => 'required_without:receiver_id|nullable|exists:groups,id',
            'receiver_id' => 'required_without:group_id|nullable|exists:users,id',
'parent_id' => [
    'nullable',
    \Illuminate\Validation\Rule::exists('messages', 'id')->where(function ($query) {
        $userId = $this->user()->id;
        $groupId = $this->input('group_id');

        if ($groupId) {
            $query->where('group_id', $groupId);
            return;
        }

        $receiverId = $this->input('receiver_id');
        $query->whereNull('group_id')->where(function ($q) use ($userId, $receiverId) {
            $q->where(function ($q2) use ($userId, $receiverId) {
                $q2->where('sender_id', $userId)->where('receiver_id', $receiverId);
            })->orWhere(function ($q2) use ($userId, $receiverId) {
                $q2->where('sender_id', $receiverId)->where('receiver_id', $userId);
            });
        });
    }),
],
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|max:1024000'
        ];
    }
}

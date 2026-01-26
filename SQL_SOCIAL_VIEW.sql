-- Create a view to get the latest message per conversation
-- This avoids complex distinct queries in the frontend
CREATE OR REPLACE VIEW social_conversations_view AS
SELECT DISTINCT ON (
    CASE 
        WHEN direction = 'incoming' THEN sender_id 
        ELSE recipient_id 
    END
)
    id as last_message_id,
    CASE 
        WHEN direction = 'incoming' THEN sender_id 
        ELSE recipient_id 
    END as conversation_id, -- The other person's ID
    message_text as last_message,
    created_at as last_activity,
    platform,
    status
FROM social_messages
ORDER BY 
    CASE 
        WHEN direction = 'incoming' THEN sender_id 
        ELSE recipient_id 
    END,
    created_at DESC;

-- Grant access to authenticated users
GRANT SELECT ON social_conversations_view TO authenticated;

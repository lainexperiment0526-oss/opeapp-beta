import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface FeedbackDialogProps {
  appId: string;
}

export function FeedbackDialog({ appId }: FeedbackDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('app_feedback')
        .insert({ app_id: appId, user_id: user.id, feedback_text: text.trim() });
      if (error) throw error;
      toast.success('Feedback sent!');
      setText('');
      setOpen(false);
    } catch {
      toast.error('Failed to send feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MessageSquare className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription className="sr-only">
            Send feedback about this app to the developers.
          </DialogDescription>
        </DialogHeader>
        {!user ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to send feedback
          </p>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Share your feedback about this app..."
              rows={4}
            />
            <Button onClick={handleSubmit} disabled={submitting || !text.trim()} className="w-full">
              {submitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

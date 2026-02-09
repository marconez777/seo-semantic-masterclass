import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, MessageCircle, Eye } from "lucide-react";

interface SocialShareProps {
  url: string;
  title: string;
  views?: number;
  comments?: number;
}

const SocialShare = ({ url, title, views, comments }: SocialShareProps) => {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`, '_blank');
  };

  const handlePinterestShare = () => {
    window.open(`https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareTitle}`, '_blank');
  };

  return (
    <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleFacebookShare}
              size="sm"
              className="bg-[#1877f2] hover:bg-[#1877f2]/90 text-white text-xs"
            >
              📘 Facebook
            </Button>
            
            <Button
              onClick={handleTwitterShare}
              size="sm"
              className="bg-[#1da1f2] hover:bg-[#1da1f2]/90 text-white text-xs"
            >
              🐦 Twitter
            </Button>
            
            <Button
              onClick={handlePinterestShare}
              size="sm"
              className="bg-[#bd081c] hover:bg-[#bd081c]/90 text-white text-xs"
            >
              📌 Pinterest
            </Button>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {comments !== undefined && (
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {comments}
              </span>
            )}
            {views && (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {views}
              </span>
            )}
            <Button variant="ghost" size="sm" className="p-1">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialShare;
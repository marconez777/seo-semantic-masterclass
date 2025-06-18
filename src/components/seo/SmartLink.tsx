
import { Link, LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SmartLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  external?: boolean;
  nofollow?: boolean;
  sponsored?: boolean;
  ugc?: boolean;
  children: React.ReactNode;
  className?: string;
}

const SmartLink = ({ 
  to, 
  external = false, 
  nofollow = false, 
  sponsored = false, 
  ugc = false, 
  children, 
  className,
  ...props 
}: SmartLinkProps) => {
  const relAttributes = [];
  if (nofollow) relAttributes.push('nofollow');
  if (sponsored) relAttributes.push('sponsored');
  if (ugc) relAttributes.push('ugc');
  if (external) relAttributes.push('noopener', 'noreferrer');

  const rel = relAttributes.length > 0 ? relAttributes.join(' ') : undefined;

  if (external || to.startsWith('http')) {
    return (
      <a 
        href={to} 
        rel={rel} 
        target={external ? '_blank' : undefined}
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link 
      to={to} 
      className={className} 
      {...props}
    >
      {children}
    </Link>
  );
};

export default SmartLink;

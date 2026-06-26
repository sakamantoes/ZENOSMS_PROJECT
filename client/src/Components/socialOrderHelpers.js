import {
  Clock, RefreshCw, CheckCircle, XCircle, AlertCircle, Zap,
} from 'lucide-react';
import {
  FaInstagram, FaFacebook, FaTwitter, FaYoutube, FaTelegram, FaSpotify,
} from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';

export const getPlatform = (serviceName) => {
  const n = (serviceName || '').toLowerCase();
  if (n.includes('instagram')) return { icon: FaInstagram, color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20'    };
  if (n.includes('facebook'))  return { icon: FaFacebook,  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    };
  if (n.includes('tiktok'))    return { icon: FaTiktok,    color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20'    };
  if (n.includes('youtube'))   return { icon: FaYoutube,   color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     };
  if (n.includes('telegram'))  return { icon: FaTelegram,  color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20'    };
  if (n.includes('spotify'))   return { icon: FaSpotify,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (n.includes('twitter') || n.includes('tweet'))
    return { icon: FaTwitter,  color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20'     };
  return { icon: Zap,          color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20'  };
};

export const getStatus = (status) => {
  const map = {
    pending:    { icon: Clock,       color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  label: 'Pending'    },
    processing: { icon: RefreshCw,   color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    label: 'Processing' },
    completed:  { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Completed'  },
    partial:    { icon: AlertCircle, color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  label: 'Partial'    },
    cancelled:  { icon: XCircle,     color: 'text-gray-400',    bg: 'bg-gray-500/10',    border: 'border-gray-500/20',    label: 'Cancelled'  },
    failed:     { icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     label: 'Failed'     },
  };
  return map[status?.toLowerCase()] || map.pending;
};

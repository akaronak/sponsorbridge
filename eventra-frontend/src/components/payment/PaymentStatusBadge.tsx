import React from 'react';
import {
  Clock,
  Check,
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  XCircle,
  X,
} from 'lucide-react';
import type { PaymentStatus } from '../../types/payment';
import { PAYMENT_STATUS_MAP } from '../../types/payment';

const ICON_MAP: Record<string, React.ReactNode> = {
  'clock':          <Clock className="w-3.5 h-3.5" />,
  'check':          <Check className="w-3.5 h-3.5" />,
  'download':       <Download className="w-3.5 h-3.5" />,
  'lock':           <Lock className="w-3.5 h-3.5" />,
  'unlock':         <Unlock className="w-3.5 h-3.5" />,
  'check-circle':   <CheckCircle2 className="w-3.5 h-3.5" />,
  'alert-triangle': <AlertTriangle className="w-3.5 h-3.5" />,
  'shield-check':   <ShieldCheck className="w-3.5 h-3.5" />,
  'shield-x':       <ShieldX className="w-3.5 h-3.5" />,
  'rotate-ccw':     <RotateCcw className="w-3.5 h-3.5" />,
  'x-circle':       <XCircle className="w-3.5 h-3.5" />,
  'x':              <X className="w-3.5 h-3.5" />,
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const info = PAYMENT_STATUS_MAP[status];
  if (!info) return <span className="text-xs text-slate-500">{status}</span>;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${info.color} ${info.bgColor} ${info.borderColor} ${sizeClasses[size]}`}
      title={info.description}
    >
      {showIcon && ICON_MAP[info.icon]}
      {info.label}
    </span>
  );
};

export default PaymentStatusBadge;

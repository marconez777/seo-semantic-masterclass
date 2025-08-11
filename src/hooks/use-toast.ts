export type ToastOptions = {
  title: string;
  description?: string;
  duration?: number; // milliseconds
};

export function toast(options: ToastOptions) {
  window.dispatchEvent(new CustomEvent<ToastOptions>("app:toast", { detail: options }));
}

export function useToast() {
  return { toast };
}

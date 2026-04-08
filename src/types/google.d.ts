// types/google.d.ts
interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: GoogleIdConfig) => void;
        prompt: (callback?: (notification: PromptNotification) => void) => void;
        cancel: () => void;
        renderButton: (element: HTMLElement, config: object) => void;
      };
    };
  };
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface PromptNotification {
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
}

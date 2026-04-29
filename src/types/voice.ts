export const VOICE_INTENTS = {
  REPLAY_VOICE_ONBOARDING: "REPLAY_VOICE_ONBOARDING",
  COMPLETE_VOICE_ONBOARDING: "COMPLETE_VOICE_ONBOARDING",
  SKIP_VOICE_ONBOARDING: "SKIP_VOICE_ONBOARDING",
  SEARCH_BOOK: "SEARCH_BOOK",
  OPEN_BOOK_DETAILS: "OPEN_BOOK_DETAILS",
  READ_SEARCH_RESULTS: "READ_SEARCH_RESULTS",
  READ_NEXT_SEARCH_RESULTS: "READ_NEXT_SEARCH_RESULTS",
  READ_PREVIOUS_SEARCH_RESULTS: "READ_PREVIOUS_SEARCH_RESULTS",
  REPEAT_SEARCH_RESULTS: "REPEAT_SEARCH_RESULTS",
  REPEAT_PAGE_GUIDANCE: "REPEAT_PAGE_GUIDANCE",
  OPEN_VOICE_HELP: "OPEN_VOICE_HELP",
  CLOSE_MODAL: "CLOSE_MODAL",
  LOGOUT: "LOGOUT",
  OPEN_ORDER: "OPEN_ORDER",
  READ_ORDER_DETAILS: "READ_ORDER_DETAILS",
  OPEN_NEXT_ORDER: "OPEN_NEXT_ORDER",
  OPEN_PREVIOUS_ORDER: "OPEN_PREVIOUS_ORDER",
  ADD_TO_CART: "ADD_TO_CART",
  READ_CART_ITEMS: "READ_CART_ITEMS",
  READ_CART_TOTAL: "READ_CART_TOTAL",
  READ_CART_ITEMS_COUNT: "READ_CART_ITEMS_COUNT",
  CLEAR_CART: "CLEAR_CART",
  REMOVE_CART_ITEM: "REMOVE_CART_ITEM",
  REMOVE_BOOK_FROM_CART: "REMOVE_BOOK_FROM_CART",
  OPEN_CART: "OPEN_CART",
  OPEN_BOOKS: "OPEN_BOOKS",
  CHECKOUT: "CHECKOUT",
  CONFIRM_CHECKOUT: "CONFIRM_CHECKOUT",
  GO_BACK: "GO_BACK",
  READ_TITLE: "READ_TITLE",
  READ_DESCRIPTION: "READ_DESCRIPTION",
  OPEN_HOME: "OPEN_HOME",
  SELECT_BOOK: "SELECT_BOOK",
  UNKNOWN: "UNKNOWN",
} as const;

export type VoiceIntent = (typeof VOICE_INTENTS)[keyof typeof VOICE_INTENTS];

export interface ParsedIntent {
  intent: VoiceIntent;
  entity: string | null;
  confidence: number;
  transcript: string;
}

export interface ParseVoiceIntentOptions {
  currentRoute?: string;
}

export interface VoiceActions {
  replayVoiceOnboarding?: () => void;
  completeVoiceOnboarding?: () => void;
  skipVoiceOnboarding?: () => void;
  openBooks?: () => void;
  searchBook?: (entity: string) => void;
  openBookDetails?: (entity: string) => void;
  readSearchResults?: () => void;
  readNextSearchResults?: () => void;
  readPreviousSearchResults?: () => void;
  repeatSearchResults?: () => void;
  repeatPageGuidance?: () => void;
  openVoiceHelp?: () => void;
  closeModal?: () => void;
  logout?: () => void;
  openOrder?: (orderNumber: string) => void;
  readOrderDetails?: (orderNumber: string | null) => void;
  openNextOrder?: () => void;
  openPreviousOrder?: () => void;
  openCart?: () => void;
  addCurrentBookToCart?: () => void;
  clearCartItems?: () => void;
  readCartItems?: () => void;
  readCartTotal?: () => void;
  readCartItemsCount?: () => void;
  removeLastCartItem?: () => void;
  removeBookFromCart?: (entity: string) => void;
  openCheckout?: () => void;
  confirmCheckout?: () => void;
  goBack?: () => void;
  readDescription?: () => void;
  onDescriptionUnavailable?: () => void;
  readTitle?: () => void;
  onTitleUnavailable?: () => void;
  selectBook?: (entity: string) => void;
  openHome?: () => void;
  onUnknown?: (intentResult: ParsedIntent) => void;
}

export interface VoiceContext {
  currentRoute: string;
}

export interface PageVoiceGuidance {
  title: string;
  description: string;
  commands: string[];
  speechText: string;
}

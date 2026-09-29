// In-memory draft of the report being created (photo -> location -> preview -> result).
const draft = {
  image: null,
  latitude: null,
  longitude: null,
  description: "",
  result: null,
};

export const getDraft = () => draft;

export function setDraft(patch) {
  Object.assign(draft, patch);
}

export function resetDraft() {
  Object.assign(draft, {
    image: null,
    latitude: null,
    longitude: null,
    description: "",
    result: null,
  });
}

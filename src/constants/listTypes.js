// Must match BLL\Enums\ListTypeEnum.cs
// TODO:  maybe an endpoint for this?
export const LIST_TYPES = {
  CUSTOM: 1,
  COMPLETED: 2,
  WATCHING: 3,
  PLANNED: 4,
  DROPPED: 5,
  FAVORITE: 6,
  BOOKMARKED: 7,
};

export const LIST_TYPE_NAMES = {
  1: 'Custom',
  2: 'Completed',
  3: 'Watching',
  4: 'Planned',
  5: 'Dropped',
  6: 'Favorite',
  7: 'Bookmarked',
};

// Helper to get list type name
export const getListTypeName = (typeId) => {
  return LIST_TYPE_NAMES[typeId] || 'Unknown';
};

// Helper to check if list type is predefined
export const isPredefinedListType = (typeId) => {
  return typeId !== LIST_TYPES.CUSTOM;
};

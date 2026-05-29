// Must match BLL\Enums\ListTypeEnum.cs
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

export const getListTypeName = (typeId) => {
  return LIST_TYPE_NAMES[typeId] || 'Unknown';
};

export const getListBadgeClassName = (listTypeId) => {
  switch (listTypeId) {
    case LIST_TYPES.CUSTOM:      return 'list-badge list-badge-custom';
    case LIST_TYPES.COMPLETED:   return 'list-badge list-badge-completed';
    case LIST_TYPES.WATCHING:    return 'list-badge list-badge-watching';
    case LIST_TYPES.PLANNED:     return 'list-badge list-badge-planned';
    case LIST_TYPES.DROPPED:     return 'list-badge list-badge-dropped';
    case LIST_TYPES.FAVORITE:    return 'list-badge list-badge-favorite';
    case LIST_TYPES.BOOKMARKED:  return 'list-badge list-badge-bookmarked';
    default:                     return 'list-badge';
  }
};

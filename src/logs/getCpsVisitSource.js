import { getCurrentRouter } from "../utils/JDH-pharmacy";
export const CPS_VISITSOURCE_ENUM = {
  HOME_LIST_POSTER: 1,
  HOME_LIST_CARD: 2,
  SEARCH_LIST_POSTER: 3,
  SEARCH_LIST_CARD: 4,
  ICON_LIST_POSTER: 5,
  ICON_LIST_CARD: 6,
  GOOD_DETAIL_POSTER: 7,
  GOOD_DETAIL_CARD: 8
}

export function getPosterVisitSource() {
  const {route} = getCurrentRouter()
  const routeMap = {
    "pages/distributionIndex/distributionIndex":
      CPS_VISITSOURCE_ENUM.HOME_LIST_POSTER,
    "pages/distributionIconDetail/distributionIconDetail":
      CPS_VISITSOURCE_ENUM.ICON_LIST_POSTER,
    "pages/distributionSearchList/distributionSearchList":
      CPS_VISITSOURCE_ENUM.SEARCH_LIST_POSTER,
    "pages/distributionGoodDetail/distributionGoodDetail":
      CPS_VISITSOURCE_ENUM.GOOD_DETAIL_POSTER,
  };

  return routeMap[route];
}

export function getCardVisitSource() {
  const {route} = getCurrentRouter()
  const routeMap = {
    "pages/distributionIndex/distributionIndex":
      CPS_VISITSOURCE_ENUM.HOME_LIST_CARD,
    "pages/distributionIconDetail/distributionIconDetail":
      CPS_VISITSOURCE_ENUM.ICON_LIST_CARD,
    "pages/distributionSearchList/distributionSearchList":
      CPS_VISITSOURCE_ENUM.SEARCH_LIST_CARD,
    "pages/distributionGoodDetail/distributionGoodDetail":
      CPS_VISITSOURCE_ENUM.GOOD_DETAIL_CARD,
  };

  return routeMap[route];
}

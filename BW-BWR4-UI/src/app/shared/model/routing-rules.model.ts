export interface RoutesByCode {
  code: string;
  routes: string[];

}

export interface MessagesByRoute {
  routeIndex: string;
  message: string;
}

export interface RoutingRules {
  routes?: RoutesByCode[];
  messages?: MessagesByRoute[];
}

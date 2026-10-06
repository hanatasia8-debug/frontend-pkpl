/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  namespace google {
    namespace maps {
      var Map: any;
      type Map = any;

      type MapOptions = any;

      var InfoWindow: any;
      type InfoWindow = any;

      var Marker: any;
      type Marker = any;

      var Size: any;
      type Size = any;

      var Point: any;
      type Point = any;

      var ControlPosition: any;
      type ControlPosition = any;

      var MapTypeId: any;
      type MapTypeId = any;

      var Animation: any;
      type Animation = any;

      function importLibrary(libraryName: string): Promise<any>;

      namespace marker {
        var AdvancedMarkerElement: any;
        type AdvancedMarkerElement = any;
      }
    }
  }

  interface Window {
    google?: any;
  }
}

export {};

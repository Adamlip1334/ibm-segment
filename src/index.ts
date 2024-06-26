import Analytics from "analytics-node";
import fs from "fs";

const productCode = "WW1314";
const productCodeType = "WWPC";

interface EventProps {
  [key: string]: any;
}

interface TrackedEvent {
  event: string;
  props: EventProps;
}

class SegmentTracker {
  private segmentAnalytics: Analytics | null = null;


  constructor(apiKey?: string) {
    if (apiKey) {
      this.segmentAnalytics = new Analytics(apiKey);
    } else {
      console.error("Segment API Key is required to initialize analytics tracking.");
    }
  }

  public async initialize(apiKey: string): Promise<void> {
    if (!apiKey) {
      throw new Error("Segment API Key is required.");
    }
    this.segmentAnalytics = new Analytics(apiKey);
  }

  public track(
    event: string,
    props: EventProps,
    userId: string = "defaultUserId"
  ) {
    if (!this.segmentAnalytics) {
      console.error("Analytics not initialized");
      return;
    }
    this.segmentAnalytics.track({
      event,
      properties: props,
      userId,
    });
    console.log(`Tracking event: ${event}`, props);
  }

  public loadAndTrackEventsFromFile(filePath: string) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const eventsData = JSON.parse(fileContent);

      Object.keys(eventsData).forEach((key) => {
        const { path, events: eventList } = eventsData[key];
        eventList.forEach((event: TrackedEvent) => {
          this.track(event.event, { ...event.props, path }, "userId"); 
        });
      });
    } catch (error) {
      console.error("Failed to load or process events file", error);
    }
  }

  public async loadAndTrackEventsFromGroup(
    filePath: string,
    groupName: string
  ): Promise<void> {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const eventsData = JSON.parse(fileContent);
  
      const groupData = eventsData[groupName];
      if (!groupData || !Array.isArray(groupData.events)) {
        console.error(
          `No events found for group ${groupName} or 'events' is not an array`
        );
        return;
      }
  

  
      groupData.events.forEach((event: TrackedEvent) => {
        if (event.event) {
          const enhancedProps = {
            ...event.props,
            productCode: productCode,
            productCodeType: productCodeType,
          };
          this.track(event.event, enhancedProps, "userId");
        } else {
          console.error(
            "Invalid event object, missing 'event' property:",
            event
          );
        }
      });
    } catch (error) {
      console.error("Failed to load or process events file", error);
    }
  }
}

export default SegmentTracker;

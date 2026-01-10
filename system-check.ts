type Component = 
  | string
  | number
  | { type: "sensor"; status: string }
  | { type: "motor"; speed: number };  // FIXED: speed should be number

function getComponentInfo(component: Component): string {
  // Check for string
  if (typeof component === "string") {
    return `Component ID: ${component}`;
  }

  // Check for number
  if (typeof component === "number") {
    return `Component Value: ${component}`;
  }

  // Check for object (including null check)
  if (typeof component === "object") {
    if (component === null) {
      return "Unknown Object Component";
    }
    
    // Check object type
    if ("type" in component) {
      if (component.type === "sensor") {
        return `Sensor Status: ${component.status}`;
      } else if (component.type === "motor") {
        return `Motor Speed: ${component.speed}`;
      }
    }
    
    return "Unknown Object Component";
  }

  // Invalid type
  return "Invalid Component Type";
}
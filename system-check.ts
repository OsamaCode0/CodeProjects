

type Component =
| string
| number
| {type: 'sensor'; status: string}
| {type: 'motor'; speed: string}

function getComponentInfo(component: Component): string {

  if (typeof component === 'string') {
      return `Component ID: ${component}`;
  }

  if (typeof component === 'number') {
      return `Component Value: ${component}`;
  }

  if (typeof component === 'object') {
    if ('object' === null) {
        return "Unknown Object Component";
    }
  }
  if ('type' in component) {
    if (component.type === 'sensor') {
        return `Sensor Status: ${component.status}`;
    } else if (component.type === 'motor') {
        return `Motor Speed: ${component.speed}`;

    }
  }

   if (typeof component !== 'string' && typeof component !== 'number') {
      return "Invalid Component Type";
  }
  // If the object does not match known types, return unknown
  return "Unknown Object Component";

}
import { DOM_TYPES } from "./h.js";

// 8.2.2 Virtual nodes equality
// This function to compare between two nodes, if it is equal (must be equal: text node and fragment not always equal)
// Element node are equal if they have the same tag: <input> tag must similar to the second node as <input> tag element.
// Nodes different types are never equal: example type: Text will never be equal with type: Fragment
export function areNodesEqual(nodeOne, nodeTwo) {
    if (nodeOne.type !== nodeTwo.type) {
        return false
    }

    if (nodeOne.type === DOM_TYPES.ELEMENT) {
        const { tag: tagOne } = nodeOne
        const { tag: tagTwo } = nodeTwo

        return tagOne == tagTwo
    }

    return true
}
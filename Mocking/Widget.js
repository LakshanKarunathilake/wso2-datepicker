import { Component } from "react";
import ChannelManager from "./ChannelManager";

export default class Widget extends Component {
  getWidgetChannelManager() {
    console.log("widget Channel Manager");
    return ChannelManager;
  }

  publish(message) {
    console.log("Published Message :", message);
  }

  getGlobalState(state) {
    return "state";
  }

  setGlobalState(state) {}
}

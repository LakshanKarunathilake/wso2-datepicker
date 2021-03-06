/* eslint-disable comma-dangle */
/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from "react";
import Widget from "@wso2-dashboards/widget";
import FlatButton from "material-ui/FlatButton";
import MenuItem from "material-ui/MenuItem";
import SelectField from "material-ui/SelectField";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import {
  NotificationSync,
  NotificationSyncDisabled
} from "material-ui/svg-icons";
import Moment from "moment";
import { Scrollbars } from "react-custom-scrollbars";
import JssProvider from "react-jss/lib/JssProvider";
import GranularityModeSelector from "./GranularityModeSelector";

// This is the workaround suggested in https://github.com/marmelab/react-admin/issues/1782
const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;

export const generateClassName = (rule, styleSheet) => {
  classCounter += 1;

  if (process.env.NODE_ENV === "production") {
    return `c${classCounter}`;
  }

  if (styleSheet && styleSheet.options.classNamePrefix) {
    let prefix = styleSheet.options.classNamePrefix;
    // Sanitize the string as will be used to prefix the generated class name.
    prefix = prefix.replace(escapeRegex, "-");

    if (prefix.match(/^Mui/)) {
      return `${prefix}-${rule.key}`;
    }

    return `${prefix}-${rule.key}-${classCounter}`;
  }

  return `${rule.key}-${classCounter}`;
};

export default class DateRangePicker extends Widget {
  constructor(props) {
    super(props);

    this.state = {
      id: props.widgetID ? "123" : props.widgetID,
      width: props.glContainer ? "100" : "124",
      // height: props.glContainer.height,
      height: "100",
      granularityMode: null,
      granularityValue: "",
      options: this.props.configs.options,
      enableSync: false,
      btnType: <NotificationSyncDisabled color="#BDBDBD" />
    };

    this.publishTimeRange = this.publishTimeRange.bind(this);
    this.getDateTimeRangeInfo = this.getDateTimeRangeInfo.bind(this);
    this.handleGranularityChange = this.handleGranularityChange.bind(this);
    this.handleGranularityChangeForCustom = this.handleGranularityChangeForCustom.bind(
      this
    );
    this.getTimeIntervalDescriptor = this.getTimeIntervalDescriptor.bind(this);
    this.getStartTimeAndEndTimeForTimeIntervalDescriptor = this.getStartTimeAndEndTimeForTimeIntervalDescriptor.bind(
      this
    );
    this.generateGranularitySelector = this.generateGranularitySelector.bind(
      this
    );
    this.OnChangeOfSelectField = this.OnChangeOfSelectField.bind(this);
    this.verifySelectedGranularityForCustom = this.verifySelectedGranularityForCustom.bind(
      this
    );
    this.onChangeForFixedTimeRange = this.onChangeForFixedTimeRange.bind(this);
    this.onChangeForCustomTimeRange = this.onChangeForCustomTimeRange.bind(
      this
    );
    this.getStartTimeAndGranularity = this.getStartTimeAndGranularity.bind(
      this
    );
    this.capitalizeCaseFirstChar = this.capitalizeCaseFirstChar.bind(this);
    this.generateGranularityMenuItems = this.generateGranularityMenuItems.bind(
      this
    );
    this.getSupportedTimeRanges = this.getSupportedTimeRanges.bind(this);
    this.getAvailableGranularities = this.getAvailableGranularities.bind(this);
    this.getSupportedGranularitiesForFixed = this.getSupportedGranularitiesForFixed.bind(
      this
    );
    this.getSupportedGranularitiesForCustom = this.getSupportedGranularitiesForCustom.bind(
      this
    );
    this.verifyDefaultGranularityOfTimeRange = this.verifyDefaultGranularityOfTimeRange.bind(
      this
    );
    this.getDefaultTimeRange = this.getDefaultTimeRange.bind(this);
    this.loadDefaultTimeRange = this.loadDefaultTimeRange.bind(this);
    this.loadUserSpecifiedCustomTimeRange = this.loadUserSpecifiedCustomTimeRange.bind(
      this
    );
    this.loadUserSpecifiedTimeRange = this.loadUserSpecifiedTimeRange.bind(
      this
    );
    this.getTimeRangeName = this.getTimeRangeName.bind(this);
    this.formatTimeRangeDetails = this.formatTimeRangeDetails.bind(this);
    this.getDateTimeFormat = this.getDateTimeFormat.bind(this);
    this.timestampToDateFormat = this.timestampToDateFormat.bind(this);
    this.getStandardDateTimeFormat = this.getStandardDateTimeFormat.bind(this);
    this.autoSyncClick = this.autoSyncClick.bind(this);
    this.setRefreshInterval = this.setRefreshInterval.bind(this);
    this.clearRefreshInterval = this.clearRefreshInterval.bind(this);
    this.setQueryParamToURL = this.setQueryParamToURL.bind(this);

    this.props.glContainer.on("resize", () =>
      this.setState({
        width: this.props.glContainer.width,
        height: this.props.glContainer.height
      })
    );
  }

  publishTimeRange(message) {
    super.publish(message);
  }

  getDateTimeRangeInfo() {
    return super.getGlobalState("dtrp");
  }

  handleGranularityChange(mode) {
    this.clearRefreshInterval();
    let granularity = "";

    if (mode !== "custom") {
      const startTimeAndGranularity = this.getStartTimeAndGranularity(mode);
      granularity = this.verifyDefaultGranularityOfTimeRange(
        startTimeAndGranularity.granularity
      );
      this.publishTimeRange({
        granularity,
        from: startTimeAndGranularity.startTime.getTime(),
        to: new Date().getTime()
      });
      this.setRefreshInterval();
      this.setState({
        granularityMode: mode,
        granularityValue: granularity,
        startTime: startTimeAndGranularity.startTime,
        endTime: new Date()
      });
    }
  }

  handleGranularityChangeForCustom(mode, startTime, endTime, granularity) {
    this.clearRefreshInterval();
    this.publishTimeRange({
      granularity,
      from: startTime.getTime(),
      to: endTime.getTime()
    });
    this.setState({
      granularityMode: mode,
      granularityValue: granularity,
      startTime,
      endTime
    });
  }

  getStartTimeAndGranularity(mode) {
    let granularity = "";
    let startTime = null;

    switch (mode) {
      case "1 Min":
        startTime = Moment()
          .subtract(1, "minutes")
          .toDate();
        granularity = "minute";
        break;
      case "15 Min":
        startTime = Moment()
          .subtract(15, "minutes")
          .toDate();
        granularity = "minute";
        break;
      case "1 Hour":
        startTime = Moment()
          .subtract(1, "hours")
          .toDate();
        granularity = "minute";
        break;
      case "1 Day":
        startTime = Moment()
          .subtract(1, "days")
          .toDate();
        granularity = "hour";
        break;
      case "7 Days":
        startTime = Moment()
          .subtract(7, "days")
          .toDate();
        granularity = "day";
        break;
      case "1 Month":
        startTime = Moment()
          .subtract(1, "months")
          .toDate();
        granularity = "day";
        break;
      case "3 Months":
        startTime = Moment()
          .subtract(3, "months")
          .toDate();
        granularity = "month";
        break;
      case "6 Months":
        startTime = Moment()
          .subtract(6, "months")
          .toDate();
        granularity = "month";
        break;
      case "1 Year":
        startTime = Moment()
          .subtract(1, "years")
          .toDate();
        granularity = "month";
        break;
      default:
      // do nothing
    }
    return { startTime, granularity };
  }

  verifyDefaultGranularityOfTimeRange(granularity) {
    const availableGranularities = this.getAvailableGranularities();
    if (
      availableGranularities.indexOf(
        this.capitalizeCaseFirstChar(granularity)
      ) > -1
    ) {
      return granularity;
    } else {
      return availableGranularities[0].toLowerCase();
    }
  }

  getDefaultTimeRange() {
    const { options } = this.state;
    const defaultTimeRange = options.defaultValue || "3 Months";
    const minGranularity = options.availableGranularities || "From Second";
    let availableViews = [];
    switch (minGranularity) {
      case "From Second":
      case "From Minute":
        availableViews = [
          "1 Min",
          "15 Min",
          "1 Hour",
          "1 Day",
          "7 Days",
          "1 Month",
          "3 Months",
          "6 Months",
          "1 Year"
        ];
        break;
      case "From Hour":
        availableViews = [
          "1 Hour",
          "1 Day",
          "7 Days",
          "1 Month",
          "3 Months",
          "6 Months",
          "1 Year"
        ];
        break;
      case "From Day":
        availableViews = [
          "1 Day",
          "7 Days",
          "1 Month",
          "3 Months",
          "6 Months",
          "1 Year"
        ];
        break;
      case "From Month":
        availableViews = ["1 Month", "3 Months", "6 Months", "1 Year"];
        break;
      case "From Year":
        availableViews = ["1 Year"];
        break;
      default:
      // do nothing
    }

    if (availableViews.indexOf(defaultTimeRange) > -1) {
      return defaultTimeRange;
    } else {
      return availableViews[0];
    }
  }

  loadDefaultTimeRange() {
    const dateTimeRangeInfo = this.getDateTimeRangeInfo();
    if (dateTimeRangeInfo.tr) {
      if (dateTimeRangeInfo.tr.toLowerCase() === "custom") {
        if (dateTimeRangeInfo.sd && dateTimeRangeInfo.ed) {
          if (dateTimeRangeInfo.g) {
            this.loadUserSpecifiedCustomTimeRange(
              dateTimeRangeInfo.sd,
              dateTimeRangeInfo.ed,
              dateTimeRangeInfo.g
            );
          } else {
            this.loadUserSpecifiedCustomTimeRange(
              dateTimeRangeInfo.sd,
              dateTimeRangeInfo.ed,
              ""
            );
          }
        } else {
          this.handleGranularityChange(this.getDefaultTimeRange());
        }
      } else {
        if (dateTimeRangeInfo.sync) {
          this.setState({
            enableSync: true,
            btnType: <NotificationSync color="#f17b31" />
          });
        }
        if (dateTimeRangeInfo.g) {
          this.loadUserSpecifiedTimeRange(
            dateTimeRangeInfo.tr,
            dateTimeRangeInfo.g
          );
        } else {
          this.loadUserSpecifiedTimeRange(dateTimeRangeInfo.tr, "");
        }
      }
    } else {
      this.handleGranularityChange(this.getDefaultTimeRange());
    }
  }

  loadUserSpecifiedCustomTimeRange(start, end, granularity) {
    const startAndEndTime = this.formatTimeRangeDetails(start, end);
    if (startAndEndTime != null) {
      this.clearRefreshInterval();
      if (
        granularity.length === 0 ||
        this.getSupportedGranularitiesForCustom(
          startAndEndTime.startTime,
          startAndEndTime.endTime
        ).indexOf(granularity) === -1
      ) {
        granularity = this.getAvailableGranularities()[0].toLowerCase();
      }
      this.publishTimeRange({
        granularity,
        from: startAndEndTime.startTime,
        to: startAndEndTime.endTime
      });
      this.setState({
        granularityMode: "custom",
        granularityValue: granularity,
        startTime: Moment(startAndEndTime.startTime).toDate(),
        endTime: Moment(startAndEndTime.endTime).toDate()
      });
    } else {
      this.handleGranularityChange(this.getDefaultTimeRange());
    }
  }

  loadUserSpecifiedTimeRange(range, granularity) {
    const timeRange = this.getTimeRangeName(range);
    if (timeRange.length > 0) {
      const supportedTimeRanges = this.getSupportedTimeRanges();
      if (supportedTimeRanges.indexOf(timeRange) > -1) {
        if (granularity.length > 0) {
          this.clearRefreshInterval();
          granularity = granularity.toLowerCase();
          const supportedGranularities = this.getSupportedGranularitiesForFixed(
            timeRange
          );
          if (
            supportedGranularities.indexOf(
              this.capitalizeCaseFirstChar(granularity)
            ) > -1
          ) {
            const availableGranularities = this.getAvailableGranularities();
            if (
              availableGranularities.indexOf(
                this.capitalizeCaseFirstChar(granularity)
              ) === -1
            ) {
              granularity = availableGranularities[0].toLowerCase();
            }
          } else {
            granularity = supportedGranularities[
              supportedGranularities.length - 1
            ].toLowerCase();
          }
          const startTimeAndDefaultGranularity = this.getStartTimeAndGranularity(
            timeRange
          );
          this.publishTimeRange({
            granularity,
            from: startTimeAndDefaultGranularity.startTime.getTime(),
            to: new Date().getTime()
          });
          this.setState({
            granularityMode: timeRange,
            granularityValue: granularity,
            startTime: startTimeAndDefaultGranularity.startTime,
            endTime: new Date()
          });
          this.setRefreshInterval();
        } else {
          this.handleGranularityChange(timeRange);
        }
      } else {
        this.handleGranularityChange(supportedTimeRanges[0]);
      }
    } else {
      this.handleGranularityChange(this.getDefaultTimeRange());
    }
  }

  getTimeRangeName(timeRange) {
    let name = "";
    if (timeRange) {
      const rangeParts = timeRange.toLowerCase().match(/[0-9]+|[a-z]+/g) || [];
      if (rangeParts.length === 2) {
        switch (rangeParts[0] + " " + rangeParts[1]) {
          case "1 min":
            name = "1 Min";
            break;
          case "15 min":
            name = "15 Min";
            break;
          case "1 hour":
            name = "1 Hour";
            break;
          case "1 day":
            name = "1 Day";
            break;
          case "7 days":
            name = "7 Days";
            break;
          case "1 month":
            name = "1 Month";
            break;
          case "3 months":
            name = "3 Months";
            break;
          case "6 months":
            name = "6 Months";
            break;
          case "1 year":
            name = "1 Year";
            break;
          default:
          // do nothing
        }
      }
    }
    return name;
  }

  formatTimeRangeDetails(startTime, endTime) {
    let start = null;
    let end = null;
    let result = null;

    const startTimeFormat = this.getDateTimeFormat(startTime);
    const endTimeFormat = this.getDateTimeFormat(endTime);

    if (startTimeFormat != null && endTimeFormat != null) {
      start = Moment(startTime, startTimeFormat).valueOf();
      end = Moment(endTime, endTimeFormat).valueOf();
      if (start !== "Invalid date" && end !== "Invalid date") {
        result = { startTime: start, endTime: end };
      }
    }
    return result;
  }

  getDateTimeFormat(dateTime) {
    const dateTimeParts = dateTime.split(" ");

    let timeFormat = null;
    if (dateTimeParts.length === 3) {
      timeFormat = "hh:mm:ss A";
    } else if (dateTimeParts.length === 2) {
      timeFormat = "hh:mm:ss";
    } else if (dateTimeParts.length === 1) {
      timeFormat = null;
    }

    let dateDelimiter = "";
    if (
      (dateTimeParts[0].match(/-/g) || []).length > 0 &&
      (dateTimeParts[0].match(/\./g) || []).length === 0 &&
      (dateTimeParts[0].match(/\//g) || []).length === 0
    ) {
      dateDelimiter = "-";
    } else if (
      (dateTimeParts[0].match(/\./g) || []).length > 0 &&
      (dateTimeParts[0].match(/-/g) || []).length === 0 &&
      (dateTimeParts[0].match(/\//g) || []).length === 0
    ) {
      dateDelimiter = ".";
    } else if (
      (dateTimeParts[0].match(/\//g) || []).length > 0 &&
      (dateTimeParts[0].match(/-/g) || []).length === 0 &&
      (dateTimeParts[0].match(/\./g) || []).length === 0
    ) {
      dateDelimiter = "/";
    } else {
      dateDelimiter = null;
    }

    let dateFormat = null;
    if (dateDelimiter != null) {
      const dateParts = dateTimeParts[0].split(dateDelimiter);
      if (dateParts.length === 2) {
        let monthFormat = "MM";
        if (dateParts[1].length === 3) {
          monthFormat = "MMM";
        }
        dateFormat = monthFormat + dateDelimiter + "YYYY";
      } else if (dateParts.length === 3) {
        let monthFormat = "MM";
        if (dateParts[1].length === 3) {
          monthFormat = "MMM";
        }
        dateFormat =
          "YYYY" + dateDelimiter + monthFormat + dateDelimiter + "DD";
      }
    } else {
      dateFormat = "YYYY";
    }

    if (dateFormat != null) {
      if (timeFormat != null) {
        return dateFormat + " " + timeFormat;
      } else {
        return dateFormat;
      }
    } else {
      return null;
    }
  }

  timestampToDateFormat(timestamp, granularityMode) {
    const format = this.getStandardDateTimeFormat(granularityMode);
    if (format.length > 0) {
      return Moment.unix(timestamp).format(format);
    } else {
      return "";
    }
  }

  getStandardDateTimeFormat(granularityMode) {
    granularityMode = granularityMode.toLowerCase();
    let format = "";
    if (granularityMode.indexOf("second") > -1) {
      format = "YYYY-MMM-DD hh:mm:ss A";
    } else if (granularityMode.indexOf("minute") > -1) {
      format = "YYYY-MMM-DD hh:mm A";
    } else if (granularityMode.indexOf("hour") > -1) {
      format = "YYYY-MMM-DD hh:00 A";
    } else if (granularityMode.indexOf("day") > -1) {
      format = "YYYY-MMM-DD";
    } else if (granularityMode.indexOf("month") > -1) {
      format = "YYYY-MMM";
    } else if (granularityMode.indexOf("year") > -1) {
      format = "YYYY";
    }
    return format;
  }

  componentDidMount() {
    this.loadDefaultTimeRange();
  }

  componentWillUnmount() {
    clearInterval(this.state.refreshIntervalId);
  }

  render() {
    const { granularityMode, width, height } = this.state;

    return (
      <JssProvider generateClassName={generateClassName}>
        <MuiThemeProvider muiTheme={this.props.muiTheme}>
          <Scrollbars style={{ width, height }}>
            <div style={{ paddingLeft: 15 }}>
              <GranularityModeSelector
                onChange={this.handleGranularityChange}
                onChangeCustom={this.handleGranularityChangeForCustom}
                options={this.state.options}
                getTimeRangeName={this.getTimeRangeName}
                getDateTimeRangeInfo={this.getDateTimeRangeInfo}
                getDefaultTimeRange={this.getDefaultTimeRange}
                theme={this.props.muiTheme}
                width={this.state.width}
                height={this.state.height}
              />
              {this.getTimeIntervalDescriptor(granularityMode)}
            </div>
          </Scrollbars>
        </MuiThemeProvider>
      </JssProvider>
    );
  }

  getTimeIntervalDescriptor(granularityMode) {
    let startAndEnd = {
      startTime: null,
      endTime: null
    };
    if (granularityMode !== "custom") {
      startAndEnd = this.getStartTimeAndEndTimeForTimeIntervalDescriptor(
        granularityMode
      );
    } else if (
      granularityMode === "custom" &&
      this.state.startTime &&
      this.state.endTime
    ) {
      startAndEnd.startTime = this.timestampToDateFormat(
        this.state.startTime.getTime() / 1000,
        this.state.granularityValue
      );
      startAndEnd.endTime = this.timestampToDateFormat(
        this.state.endTime.getTime() / 1000,
        this.state.granularityValue
      );
    }

    const { startTime, endTime } = startAndEnd;
    if (granularityMode && startTime && endTime) {
      this.setQueryParamToURL(
        granularityMode.replace(" ", "").toLowerCase(),
        startTime.toLowerCase(),
        endTime.toLowerCase(),
        this.state.granularityValue,
        this.state.enableSync
      );
      return (
        <div
          style={{
            display: "flex",
            alignContent: "center",
            width: "100%"
          }}
        >
          <div
            style={{
              lineHeight: 3,
              verticalAlign: "middle"
            }}
          >
            {`${startTime}`}
            <span style={{ color: "#828282" }}> to </span>
            {`${endTime}`}
            <span style={{ color: "#828282" }}> per </span>
          </div>
          {this.generateGranularitySelector()}
          <FlatButton
            label="Auto-Sync"
            icon={this.state.btnType}
            onClick={this.autoSyncClick}
            style={{
              marginLeft: 20,
              marginTop: 8
            }}
          />
        </div>
      );
    } else {
      return null;
    }
  }

  getStartTimeAndEndTimeForTimeIntervalDescriptor(granularityMode) {
    let startTime = null;
    let endTime = null;

    switch (granularityMode) {
      case "1 Min":
        startTime = Moment()
          .subtract(1, "minutes")
          .format("YYYY-MMM-DD hh:mm A");
        endTime = Moment().format("YYYY-MMM-DD hh:mm A");
        break;
      case "15 Min":
        startTime = Moment()
          .subtract(15, "minutes")
          .format("YYYY-MMM-DD hh:mm A");
        endTime = Moment().format("YYYY-MMM-DD hh:mm A");
        break;
      case "1 Hour":
        startTime = Moment()
          .subtract(1, "hours")
          .format("YYYY-MMM-DD hh:mm A");
        endTime = Moment().format("YYYY-MMM-DD hh:mm A");
        break;
      case "1 Day":
        startTime = Moment()
          .subtract(1, "days")
          .format("YYYY-MMM-DD");
        endTime = Moment().format("YYYY-MMM-DD");
        break;
      case "7 Days":
        startTime = Moment()
          .subtract(7, "days")
          .format("YYYY-MMM-DD");
        endTime = Moment().format("YYYY-MMM-DD");
        break;
      case "1 Month":
        startTime = Moment()
          .subtract(1, "months")
          .format("YYYY-MMM");
        endTime = Moment().format("YYYY-MMM");
        break;
      case "3 Months":
        startTime = Moment()
          .subtract(3, "months")
          .format("YYYY-MMM");
        endTime = Moment().format("YYYY-MMM");
        break;
      case "6 Months":
        startTime = Moment()
          .subtract(6, "months")
          .format("YYYY-MMM");
        endTime = Moment().format("YYYY-MMM");
        break;
      case "1 Year":
        startTime = Moment()
          .subtract(1, "years")
          .format("YYYY");
        endTime = Moment().format("YYYY");
        break;
      default:
      // do nothing
    }
    return { startTime, endTime };
  }

  generateGranularitySelector() {
    return (
      <SelectField
        value={this.getDefaultSelectedOption()}
        onChange={(event, index, value) => {
          this.setQueryParamToURL(
            this.state.granularityMode.replace(" ", "").toLowerCase(),
            this.timestampToDateFormat(
              this.state.startTime.getTime(),
              this.state.granularityMode
            ).toLowerCase(),
            this.timestampToDateFormat(
              this.state.endTime.getTime(),
              this.state.granularityMode
            ).toLowerCase(),
            value,
            this.state.enableSync
          );
          this.OnChangeOfSelectField(value);
        }}
        style={{ marginLeft: 10 }}
      >
        {this.generateGranularityMenuItems()}
      </SelectField>
    );
  }

  OnChangeOfSelectField(value) {
    if (this.state.granularityMode === "custom") {
      this.onChangeForCustomTimeRange(value);
    } else {
      this.onChangeForFixedTimeRange(value);
    }
  }

  getDefaultSelectedOption() {
    if (this.state.granularityMode === "custom") {
      return this.verifySelectedGranularityForCustom(
        this.state.granularityValue
      );
    } else {
      return this.state.granularityValue;
    }
  }

  verifySelectedGranularityForCustom(granularity) {
    if (
      this.getSupportedGranularitiesForCustom(
        this.state.startTime,
        this.state.endTime
      ).indexOf(this.capitalizeCaseFirstChar(granularity)) > -1
    ) {
      return granularity;
    } else {
      return "";
    }
  }

  onChangeForFixedTimeRange(value) {
    this.publishTimeRange({
      granularity: value,
      from: this.state.startTime.getTime(),
      to: this.state.endTime.getTime()
    });
    this.setState({ granularityValue: value });
  }

  onChangeForCustomTimeRange(value) {
    this.publishTimeRange({
      granularity: value,
      from: Moment(this.state.startTime)
        .startOf(value)
        .valueOf(),
      to: Moment(this.state.endTime)
        .startOf(value)
        .valueOf()
    });
    this.setState({ granularityValue: value });
  }

  generateGranularityMenuItems() {
    let supportedGranularities = [];
    if (this.state.granularityMode === "custom") {
      supportedGranularities = this.getSupportedGranularitiesForCustom(
        this.state.startTime,
        this.state.endTime
      );
    } else {
      supportedGranularities = this.getSupportedGranularitiesForFixed(
        this.state.granularityMode
      );
    }

    return this.getAvailableGranularities().map(view => (
      <MenuItem
        value={view.toLowerCase()}
        primaryText={view}
        disabled={supportedGranularities.indexOf(view) === -1}
      />
    ));
  }

  capitalizeCaseFirstChar(str) {
    let result = "";
    if (str) {
      result = str.charAt(0).toUpperCase() + str.slice(1);
    }
    return result;
  }

  getSupportedTimeRanges() {
    const minGranularity =
      this.state.options.availableGranularities || "From Second";
    let timeRanges = [];
    switch (minGranularity) {
      case "From Second":
      case "From Minute":
        timeRanges = [
          "1 Min",
          "15 Min",
          "1 Hour",
          "1 Day",
          "7 Days",
          "1 Month",
          "3 Months",
          "6 Months",
          "1 Year"
        ];
        break;
      case "From Hour":
        timeRanges = [
          "1 Hour",
          "1 Day",
          "7 Days",
          "1 Month",
          "3 Months",
          "6 Months",
          "1 Year"
        ];
        break;
      case "From Day":
        timeRanges = [
          "1 Day",
          "7 Days",
          "1 Month",
          "3 Months",
          "6 Months",
          "1 Year"
        ];
        break;
      case "From Month":
        timeRanges = ["1 Month", "3 Months", "6 Months", "1 Year"];
        break;
      case "From Year":
        timeRanges = ["1 Year"];
        break;
      default:
      // do nothing
    }
    return timeRanges;
  }

  getAvailableGranularities() {
    const minGranularity =
      this.state.options.availableGranularities || "From Second";
    let granularities = [];
    switch (minGranularity) {
      case "From Second":
        granularities = ["Second", "Minute", "Hour", "Day", "Month", "Year"];
        break;
      case "From Minute":
        granularities = ["Minute", "Hour", "Day", "Month", "Year"];
        break;
      case "From Hour":
        granularities = ["Hour", "Day", "Month", "Year"];
        break;
      case "From Day":
        granularities = ["Day", "Month", "Year"];
        break;
      case "From Month":
        granularities = ["Month", "Year"];
        break;
      case "From Year":
        granularities = ["Year"];
        break;
      default:
      // do nothing
    }
    return granularities;
  }

  getSupportedGranularitiesForFixed(granularityMode) {
    let supportedGranularities = [];
    switch (granularityMode) {
      case "1 Min":
      case "15 Min":
        supportedGranularities = ["Second", "Minute"];
        break;
      case "1 Hour":
        supportedGranularities = ["Second", "Minute", "Hour"];
        break;
      case "1 Day":
      case "7 Days":
        supportedGranularities = ["Second", "Minute", "Hour", "Day"];
        break;
      case "1 Month":
      case "3 Months":
      case "6 Months":
        supportedGranularities = ["Second", "Minute", "Hour", "Day", "Month"];
        break;
      case "1 Year":
        supportedGranularities = [
          "Second",
          "Minute",
          "Hour",
          "Day",
          "Month",
          "Year"
        ];
        break;
      default:
      // do nothing
    }
    return supportedGranularities;
  }

  getSupportedGranularitiesForCustom(startTime, endTime) {
    const start = Moment(startTime);
    const end = Moment(endTime);
    const supportedGranularities = [];

    if (end.diff(start, "seconds") !== 0) {
      supportedGranularities.push("Second");
    }
    if (end.diff(start, "minutes") !== 0) {
      supportedGranularities.push("Minute");
    }
    if (end.diff(start, "hours") !== 0) {
      supportedGranularities.push("Hour");
    }
    if (end.diff(start, "days") !== 0) {
      supportedGranularities.push("Day");
    }
    if (end.diff(start, "months") !== 0) {
      supportedGranularities.push("Month");
    }
    if (end.diff(start, "years") !== 0) {
      supportedGranularities.push("Year");
    }
    return supportedGranularities;
  }

  autoSyncClick() {
    if (!this.state.enableSync) {
      this.setState(
        {
          enableSync: true,
          btnType: <NotificationSync color="#f17b31" />
        },
        this.setRefreshInterval
      );
    } else {
      this.setState({
        enableSync: false,
        btnType: <NotificationSyncDisabled color="#BDBDBD" />
      });
      this.clearRefreshInterval();
    }
  }

  setRefreshInterval() {
    if (this.state.enableSync) {
      const refreshInterval =
        this.state.options.autoSyncInterval * 1000 || 10000;
      const refresh = () => {
        const startTimeAndGranularity = this.getStartTimeAndGranularity(
          this.state.granularityMode
        );
        this.publishTimeRange({
          granularity: this.state.granularityValue,
          from: startTimeAndGranularity.startTime.getTime(),
          to: new Date().getTime()
        });
      };
      const intervalID = setInterval(refresh, refreshInterval);
      this.setState({
        refreshIntervalId: intervalID,
        endTime: new Date()
      });
    }
  }

  clearRefreshInterval() {
    clearInterval(this.state.refreshIntervalId);
    this.setState({
      refreshIntervalId: null
    });
  }

  setQueryParamToURL(timeRange, startTime, endTime, granularity, autoSync) {
    super.setGlobalState("dtrp", {
      tr: timeRange,
      sd: startTime,
      ed: endTime,
      g: granularity,
      sync: autoSync
    });
  }
}

if (global.dashboard != undefined) {
  global.dashboard.registerWidget("DateRangePicker", DateRangePicker);
}

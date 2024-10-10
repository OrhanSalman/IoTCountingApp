import React from "react";
import { notification } from "antd";

const NotificationComponent = (
  msg,
  desc,
  type,
  showProgress = false,
  pauseOnHover = false,
  duration = 2
) => {
  const [api, contextHolder] = notification.useNotification();
  const openNotification = () => () => {
    api[type].open({
      message: { msg },
      description: { desc },
      showProgress: { showProgress },
      pauseOnHover: { pauseOnHover },
      duration: { duration },
    });
  };
  return <>{contextHolder}</>;
};
export default NotificationComponent;

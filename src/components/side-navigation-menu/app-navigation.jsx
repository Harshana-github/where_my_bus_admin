export const navigation = [
  {
    text: "home",
    path: "/home",
    icon: "home",
  },
  {
    text: "driver",
    path: "/driver-list",
    icon: "user",
  },
  // {
  //   text: "todo_list",
  //   path: "/todo-list",
  //   icon: "checklist",
  // },
  // {
  //   text: "work_report",
  //   path: "/work-report",
  //   icon: "chart",
  // },
  {
    text: "setting",
    icon: "preferences",
    items: [
      { text: "system_settings", path: "/system-settings" },
      { text: "view_user", path: "/view-user" },
    ],
  },
];

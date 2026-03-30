import { ref } from "vue";

const teamData = ref([
  {
    name: "Vansh Mittal",
    msg: "Available Work from home",
    status: "🏠 WFH",
    statusCode: "wfh",
    time: "9:00 AM",
  },
  {
    name: "Rohan Sharma",
    msg: "Available at Office",
    status: "🏢 Office",
    statusCode: "wfo",
    time: "9:15 AM",
  },
  {
    name: "Prem Singh",
    msg: "Available at Office",
    status: "🏢 Office",
    statusCode: "wfo",
    time: "9:15 AM",
  },
  {
    name: "Jeev Mohan",
    msg: "Available at Office",
    status: "🏢 Office",
    statusCode: "wfo",
    time: "8:45 AM",
  },
  {
    name: "Jeet",
    msg: "Available Work from Home",
    status: "🏠 WFH",
    statusCode: "wfh",
    time: "8:45 AM",
  },
]);

export function useData() {
  return {
    teamData,
  };
}

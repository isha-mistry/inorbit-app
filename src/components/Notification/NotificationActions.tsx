"use client";

import React from "react";
import { FaClock, FaPlay, FaUserCheck, FaBell, FaVoteYea } from "react-icons/fa";
import { IoCheckmarkCircle } from "react-icons/io5";
import {
  BsDatabaseFillCheck,
  BsFillExclamationCircleFill
} from "react-icons/bs";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { PiVideoFill } from "react-icons/pi";
import { GiChaingun } from "react-icons/gi";
import { MEETING_BASE_URL } from "@/config/constants";
import { useAccount } from "wagmi";
import { useNotificationStudioState } from "@/store/notificationStudioState";
import { getAccessToken } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";

export const getBackgroundColor = (data: any) => {
  if (data?.notification_type === "newBooking") {
    if (data?.notification_name === "newBookingForHost") {
      return "#FFE6CC";
    } else if (data?.notification_name === "newBookingForGuest") {
      return "#D4F1E0";
    } else if (data?.notification_name === "sessionRejectionForGuest") {
      return "#fcc5b8";
    } else if (
      data?.notification_name === "sessionStartedByHost" ||
      data?.notification_name === "sessionStartedByGuest"
    ) {
      return "#b9cef0";
    }
  } else if (data?.notification_type === "recordedSession") {
    return "#E5CCFF";
  } else if (data?.notification_type === "newFollower") {
    return "#C2DFFF";
  } else if (data?.notification_type === "attestation") {
    if (data?.notification_name === "offchain") {
      return "#E5CCFF";
    } else if (data?.notification_name === "onchain") {
      return "#E5CCFF";
    }
  } else if (data?.notification_type === "officeHours") {
    if (data?.notification_name === "officeHoursScheduled") {
      return "#fff0cf";
    } else if (data?.notification_name === "officeHoursStarted") {
      return "#b9cef0";
    } else if (data?.notification_name === "officeHoursDeleted") {
      return "#fcc5b8";
    } else if (data?.notification_name === "officeHoursReminder") {
      return "#fcc7c7";
    }
  } else if (data?.notification_type === "proposalVote") {
    return "#cdf7e3";
  }
  return "#bed9f8";
};

export const getIcon = (data: any) => {
  if (data?.notification_type === "newBooking") {
    if (data?.notification_name === "newBookingForHost") {
      return <FaClock color="#FF8A00" size={18} />;
    } else if (data?.notification_name === "newBookingForGuest") {
      return <IoCheckmarkCircle color="#00C259" size={18} />;
    } else if (data?.notification_name === "sessionRejectionForGuest") {
      return <BsFillExclamationCircleFill color="#f7552d" size={18} />;
    } else if (
      data?.notification_name === "sessionStartedByHost" ||
      data?.notification_name === "sessionStartedByGuest"
    ) {
      return <FaPlay color="#1061e6" size={18} />;
    }
  } else if (data?.notification_type === "recordedSession") {
    return <PiVideoFill color="#9747FF" size={18} />;
  } else if (data?.notification_type === "newFollower") {
    return <FaUserCheck color="#0057FF" size={18} />;
  } else if (data?.notification_type === "attestation") {
    if (data?.notification_name === "offchain") {
      return <BsDatabaseFillCheck color="#9747FF" size={18} />;
    } else if (data?.notification_name === "onchain") {
      return <GiChaingun color="#9747FF" size={18} />;
    }
  } else if (data?.notification_type === "officeHours") {
    if (data?.notification_name === "officeHoursScheduled") {
      return <RiCalendarScheduleFill color="#cf9008" size={18} />;
    } else if (data?.notification_name === "officeHoursStarted") {
      return <FaPlay color="#1061e6" size={18} />;
    } else if (data?.notification_name === "officeHoursDeleted") {
      return <BsFillExclamationCircleFill color="#f7552d" size={18} />;
    } else if (data?.notification_name === "officeHoursReminder") {
      return <FaBell color="#d13f3f" size={18} />;
    }
  } else if (data?.notification_type === "proposalVote") {
    return <FaVoteYea color="#10693e" size={18} />;
  }
  return null;
};

export const markAsRead = async (data: any): Promise<void> => {
  const { setNotifications, updateCombinedNotifications } =
    useNotificationStudioState.getState();
  const token = await getAccessToken();
  try {
    const myHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(data.receiver_address && {
        "x-wallet-address": data.receiver_address,
        Authorization: `Bearer ${token}`,
      }),
    };

    const raw = JSON.stringify({
      id: data?._id,
      receiver_address: data.receiver_address,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };
    const response = await fetchApi(
      "/notifications/mark-as-read",
      requestOptions
    );
    const result = await response.json();
    if (result.success) {
      // Update the state in the store
      setNotifications((prev) =>
        prev.map((n) => (n._id === data._id ? { ...n, read_status: true } : n))
      );
      updateCombinedNotifications();
    } else {
      console.error("Error marking as read:", result.message);
    }
  } catch (error) {
    console.error("Error marking as read:", error);
  }
};

export const handleRedirection = async (
  data: any,
  router: any,
  markAsReadFunction: (data: any) => Promise<void>
): Promise<void> => {
  if (data.notification_type === "newBooking") {
    if (data.notification_name === "newBookingForHost") {
      router.push(
        `/profile/${data.receiver_address}?active=sessions&session=book`
      );
    } else if (data.notification_name === "newBookingForGuest") {
      router.push(
        `/profile/${data.receiver_address}?active=sessions&session=attending`
      );
    } else if (data.notification_name === "sessionRejectionForGuest") {
      router.push(
        `/profile/${data.receiver_address}?active=sessions&session=attending`
      );
    } else if (data.notification_name === "sessionStartedByHost") {
      router.push(
        `${MEETING_BASE_URL}/meeting/session/${data.additionalData.meetingId}/lobby`
      );
    } else if (data.notification_name === "sessionStartedByGuest") {
      router.push(
        `${MEETING_BASE_URL}/meeting/session/${data.additionalData.meetingId}/lobby`
      );
    }
  } else if (data.notification_type === "attestation") {
    if (data.additionalData.notification_user_role === "session_hosted") {
      router.push(
        `/profile/${data.receiver_address}?active=sessions&session=hosted`
      );
    } else if (
      data.additionalData.notification_user_role === "session_attended"
    ) {
      router.push(
        `/profile/${data.receiver_address}?active=sessions&session=attended`
      );
    }
  } else if (data.notification_type === "officeHours") {
    if (data.notification_name === "officeHoursScheduled") {
      router.push(
        `/${data.additionalData.dao_name}/${data.additionalData.host_address}?active=lectures&lectures=upcoming`
      );
    } else if (
      (data.notification_name === "officeHoursStarted" ||
        data.notification_name === "officeHoursReminder") &&
      data.additionalData.meetingId
    ) {
      router.push(
        `${MEETING_BASE_URL}/meeting/officehours/${data.additionalData.meetingId}/lobby`
      );
    }
  } else if (data.notification_type === "proposalVote") {
    router.push(
      `${data.additionalData.proposalLink}`
    );
  }
  if (!data.read_status) {
    await markAsReadFunction(data);
  }
};

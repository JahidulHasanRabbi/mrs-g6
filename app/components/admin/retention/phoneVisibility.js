"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminMembers } from "../../../api/crmApi";
import { tokenStorage } from "../../../api/tokenStorage";
import { ADMIN_PERMISSIONS, hasAdminPermission } from "../../../config/adminPermissions";

const ASSIGNED_MEMBERS_PAGE_SIZE = 100;
const HIDDEN_PHONE_LABEL = "*****";

// A member can appear in more than one Retention view during a session. Keep
// the assignment lookup shared so navigating between those views does not
// issue the same paginated requests repeatedly.
const assignedMemberIdsCache = new Map();

function responseResults(response) {
  return Array.isArray(response?.results)
    ? response.results
    : Array.isArray(response)
      ? response
      : [];
}

async function fetchAssignedMemberIds(adminUuid) {
  const memberIds = new Set();
  let page = 1;

  while (true) {
    const response = await getAdminMembers(adminUuid, {
      page,
      page_size: ASSIGNED_MEMBERS_PAGE_SIZE,
    });
    const rows = responseResults(response);

    rows.forEach((member) => {
      if (member?.uuid) memberIds.add(String(member.uuid));
    });

    if (!response?.next || rows.length === 0) break;
    page += 1;
  }

  return memberIds;
}

function getAssignedMemberIds(adminUuid) {
  if (!adminUuid) return Promise.resolve(new Set());

  const cached = assignedMemberIdsCache.get(adminUuid);
  if (cached) return cached;

  const request = fetchAssignedMemberIds(adminUuid).catch((error) => {
    // Fail closed when the assignment lookup is unavailable. A missing
    // permission must never reveal a phone number by accident.
    console.error("[phone-visibility] assigned member lookup failed", error);
    return new Set();
  });
  assignedMemberIdsCache.set(adminUuid, request);
  return request;
}

export function maskPhoneNumber(value) {
  return value === null || value === undefined || value === ""
    ? "—"
    : HIDDEN_PHONE_LABEL;
}

export function usePhoneVisibility() {
  const [canViewAll, setCanViewAll] = useState(false);
  const [assignedMemberIds, setAssignedMemberIds] = useState(null);

  useEffect(() => {
    const hasPhonePermission = hasAdminPermission(ADMIN_PERMISSIONS.VIEW_PHONE_NUMBERS);
    if (hasPhonePermission) {
      setCanViewAll(true);
      setAssignedMemberIds(new Set());
      return undefined;
    }

    const adminUuid = tokenStorage.getAdminUuid();
    let cancelled = false;

    getAssignedMemberIds(adminUuid).then((memberIds) => {
      if (cancelled) return;
      setAssignedMemberIds(memberIds);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const canViewPhoneNumber = useCallback((memberOrUuid) => {
    if (canViewAll) return true;
    if (!assignedMemberIds) return false;

    const uuid = typeof memberOrUuid === "object"
      ? memberOrUuid?.uuid
      : memberOrUuid;
    return Boolean(uuid && assignedMemberIds.has(String(uuid)));
  }, [assignedMemberIds, canViewAll]);

  const displayPhoneNumber = useCallback((member) => {
    const value = typeof member === "object"
      ? member?.phone_number ?? member?.phone
      : member;

    return canViewPhoneNumber(member) ? (value || "—") : maskPhoneNumber(value);
  }, [canViewPhoneNumber]);

  return { canViewAll, canViewPhoneNumber, displayPhoneNumber };
}

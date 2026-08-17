"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemedPageShell from "../themes/shared/ThemedPageShell";
import ThemedActionButton from "../themes/shared/ThemedActionButton";
import { getRedeemLinkInfo, redeemLink } from "../../api/memberApi";
import { tokenStorage } from "../../api/tokenStorage";
import {
  describeRedeemFailure,
  describeReward,
  safeStationUrl,
} from "./redeemLinkMemberUtils.mjs";

/**
 * Member-facing redeem screen for a shared campaign link.
 *
 * Reached via the URL the admin copies: /?o=<station_url>&reward=<uuid>.
 * That single URL carries everything needed — `o` is both the theme key and
 * the login destination, `reward` is the link to claim.
 *
 * Flow:
 *   logged out -> show what the link offers, then send them to the station
 *   logged in  -> "Redeem and get X" -> POST -> success/error -> back to /
 */
export default function RedeemLinkScreen({ linkUuid, origin }) {
  const router = useRouter();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState(null); // { ok: boolean, message: string }

  // Resolved once on mount: reading auth during render would differ between
  // the server pass and hydration.
  const [memberUuid, setMemberUuid] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMemberUuid(tokenStorage.getMemberUuid());
    setAuthChecked(true);
  }, []);

  // The info endpoint is public, so this runs for logged-out visitors too and
  // is what lets them see the offer before being sent off to log in.
  useEffect(() => {
    if (!linkUuid) {
      setLoading(false);
      setLoadError("This redeem link is missing or incomplete.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    getRedeemLinkInfo(linkUuid)
      .then((data) => {
        if (!cancelled) setInfo(data || null);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(describeRedeemFailure(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [linkUuid]);

  // Prefer the station URL the link itself carries; the `o` from the query
  // string is the fallback, and both are validated before we navigate.
  const stationUrl = safeStationUrl(info?.station_url || origin);

  const goToStation = useCallback(() => {
    if (stationUrl) {
      window.location.href = stationUrl;
    } else {
      router.push("/");
    }
  }, [router, stationUrl]);

  const handleRedeem = async () => {
    if (claiming || !memberUuid || !linkUuid) return;
    setClaiming(true);
    try {
      await redeemLink(linkUuid, memberUuid);
      setResult({ ok: true, message: `You received ${describeReward(info)}.` });
    } catch (error) {
      setResult({ ok: false, message: describeRedeemFailure(error) });
    } finally {
      setClaiming(false);
    }
  };

  const isLoggedIn = Boolean(memberUuid);

  return (
    <ThemedPageShell title="Redeem Reward" showNav={false}>
      {/* Every theme background is a lit stage/platform in the lower half of
          the scene, so the card is pushed down to sit on it rather than
          floating over the arch at the top. */}
      <div className="flex min-h-[calc(100vh-184px)] flex-col items-center justify-end px-5 pb-[8vh]">
        <Card>
          {loading || !authChecked ? (
            <Message text="Loading your reward..." />
          ) : loadError ? (
            <>
              <Message text={loadError} tone="error" />
              <Actions>
                <ThemedActionButton
                  onClick={() => router.push("/")}
                  fallback={<DefaultButton onClick={() => router.push("/")}>Continue</DefaultButton>}
                >
                  Continue
                </ThemedActionButton>
              </Actions>
            </>
          ) : result ? (
            <ResultView result={result} onContinue={() => router.push("/")} />
          ) : (
            <OfferView
              info={info}
              isLoggedIn={isLoggedIn}
              claiming={claiming}
              onRedeem={handleRedeem}
              onLogin={goToStation}
            />
          )}
        </Card>
      </div>
    </ThemedPageShell>
  );
}

function OfferView({ info, isLoggedIn, claiming, onRedeem, onLogin }) {
  const reward = describeReward(info);
  const label = isLoggedIn ? (claiming ? "Redeeming..." : "Redeem Now") : "Login to Redeem";
  const action = isLoggedIn ? onRedeem : onLogin;

  return (
    <>
      {info?.name ? (
        <p className="text-center text-[13px] uppercase tracking-[1px] text-white/60">{info.name}</p>
      ) : null}

      <p className="mt-3 text-center text-[15px] text-white/80">
        {isLoggedIn ? "Redeem and get" : "Log in to claim"}
      </p>
      <p className="mt-2 text-center text-[30px] font-bold leading-tight text-white">{reward}</p>

      {info?.station ? (
        <p className="mt-3 text-center text-[13px] text-white/60">at {info.station}</p>
      ) : null}

      {!isLoggedIn ? (
        <p className="mt-4 text-center text-[13px] leading-[19px] text-white/60">
          You need to be logged in to claim this reward. We&apos;ll take you to
          {info?.station ? ` ${info.station}` : " your site"} to sign in.
        </p>
      ) : null}

      <Actions>
        <ThemedActionButton
          onClick={action}
          disabled={claiming}
          fallback={
            <DefaultButton onClick={action} disabled={claiming}>
              {label}
            </DefaultButton>
          }
        >
          {label}
        </ThemedActionButton>
      </Actions>
    </>
  );
}

function ResultView({ result, onContinue }) {
  return (
    <>
      <StatusMark ok={result.ok} />
      <p className="mt-4 text-center text-[20px] font-bold text-white">
        {result.ok ? "Reward Claimed" : "Could Not Redeem"}
      </p>
      <p
        className={`mt-2 text-center text-[14px] leading-[21px] ${result.ok ? "text-white/80" : "text-[#ff9aa4]"}`}
      >
        {result.message}
      </p>
      <Actions>
        <ThemedActionButton
          onClick={onContinue}
          fallback={<DefaultButton onClick={onContinue}>Continue</DefaultButton>}
        >
          Continue
        </ThemedActionButton>
      </Actions>
    </>
  );
}

function StatusMark({ ok }) {
  return (
    <div
      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
      style={{ backgroundColor: ok ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)" }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ok ? "#65d072" : "#ff6b74"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ok ? <polyline points="20 6 9 17 4 12" /> : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
      </svg>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="w-full max-w-[380px] rounded-[18px] border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
      {children}
    </div>
  );
}

function Actions({ children }) {
  return <div className="mt-6 flex justify-center">{children}</div>;
}

function Message({ text, tone }) {
  return (
    <p className={`text-center text-[15px] ${tone === "error" ? "text-[#ff9aa4]" : "text-white/80"}`}>
      {text}
    </p>
  );
}

// Used on the default (unthemed) portal, where ThemedActionButton has no
// ornate button to resolve.
function DefaultButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[10px] border-2 border-[#f2cb7a] px-8 py-2.5 text-[15px] font-semibold text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundImage: "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)" }}
    >
      {children}
    </button>
  );
}

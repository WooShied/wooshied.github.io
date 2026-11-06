import { profile } from "../content/profile";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.identity.name}
        </p>
        <p>Built from scratch. No trackers, no cookies.</p>
        <p>
          Updated <time dateTime={profile.lastUpdated}>{profile.lastUpdated}</time>
        </p>
      </div>
    </footer>
  );
}

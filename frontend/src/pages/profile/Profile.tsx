import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Profile.scss";

const API_BASE_URL = "/api/v1";

type ProfileData = {
	username: string;
	email: string;
};

function Profile() {
	const { token } = useAuth();
	const [profile, setProfile] = useState<ProfileData>({ username: "", email: "" });
	const [profileLoading, setProfileLoading] = useState(false);
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [profileStatus, setProfileStatus] = useState<string | null>(null);
	const [profileError, setProfileError] = useState<string | null>(null);
	const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!token) {
				setIsLoadingProfile(false);
				return;
			}
			setIsLoadingProfile(true);
			setProfileError(null);
			setProfileStatus(null);

			try {
				const res = await fetch(`${API_BASE_URL}/users/me`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					setProfileError("Unable to load your profile.");
					return;
				}

				const data = await res.json();
				setProfile({ username: data.username ?? "", email: data.email ?? "" });
			} catch {
				setProfileError("Unable to load your profile.");
			} finally {
				setIsLoadingProfile(false);
			}
		};

		fetchProfile();
	}, [token]);

	const handleProfileSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!token) return;

		setProfileLoading(true);
		setProfileError(null);
		setProfileStatus(null);

		try {
			const res = await fetch(`${API_BASE_URL}/users/me`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(profile),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				setProfileError(data?.detail ?? "Profile update failed.");
				return;
			}

			const data = await res.json();
			setProfile({ username: data.username ?? "", email: data.email ?? "" });
			setProfileStatus("Profile updated successfully.");
		} catch {
			setProfileError("Profile update failed.");
		} finally {
			setProfileLoading(false);
		}
	};

	const handlePasswordSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!token) return;

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setPasswordError("New password and confirmation do not match.");
			return;
		}

		setPasswordLoading(true);
		setPasswordError(null);
		setPasswordStatus(null);

		try {
			const res = await fetch(`${API_BASE_URL}/users/me/password`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					current_password: passwordData.currentPassword,
					new_password: passwordData.newPassword,
				}),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				setPasswordError(data?.detail ?? "Password update failed.");
				return;
			}

			setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
			setPasswordStatus("Password updated successfully.");
		} catch {
			setPasswordError("Password update failed.");
		} finally {
			setPasswordLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="profile">
				<div className="profile__card">
					<h1 className="profile__title">Profile</h1>
					<p className="profile__subtitle">Sign in to update your details.</p>
					<Link to="/login" className="profile__link">
						Go to login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="profile">
			<div className="profile__card profile__card--wide">
				<h1 className="profile__title">Your profile</h1>
				<p className="profile__subtitle">Update your account details and password.</p>
			</div>

			{isLoadingProfile ? (
				<div className="profile__card">
					<p className="profile__hint">Loading profile…</p>
				</div>
			) : (
				<div className="profile__grid">
					<div className="profile__card">
						<h2 className="profile__section-title">Account details</h2>
						<form className="profile__form" onSubmit={handleProfileSubmit}>
							<div className="profile__field">
								<label className="profile__label">Name</label>
								<input
									className="profile__input"
									type="text"
									placeholder="Your name"
									value={profile.username}
									onChange={(e) => setProfile({ ...profile, username: e.target.value })}
									required
								/>
							</div>

							<div className="profile__field">
								<label className="profile__label">Email</label>
								<input
									className="profile__input"
									type="email"
									placeholder="you@example.com"
									value={profile.email}
									onChange={(e) => setProfile({ ...profile, email: e.target.value })}
									required
								/>
							</div>

							  {profileError && <p className="profile__error">{profileError}</p>}
							  {profileStatus && <p className="profile__success">{profileStatus}</p>}

							<button className="profile__submit" type="submit" disabled={profileLoading}>
								{profileLoading ? "Saving…" : "Save changes"}
							</button>
						</form>
					</div>

					<div className="profile__card">
						<h2 className="profile__section-title">Change password</h2>
						<form className="profile__form" onSubmit={handlePasswordSubmit}>
							<div className="profile__field">
								<label className="profile__label">Current password</label>
								<input
									className="profile__input"
									type="password"
									placeholder="••••••••"
									value={passwordData.currentPassword}
									onChange={(e) =>
										setPasswordData({ ...passwordData, currentPassword: e.target.value })
									}
									required
								/>
							</div>

							<div className="profile__field">
								<label className="profile__label">New password</label>
								<input
									className="profile__input"
									type="password"
									placeholder="••••••••"
									value={passwordData.newPassword}
									onChange={(e) =>
										setPasswordData({ ...passwordData, newPassword: e.target.value })
									}
									required
								/>
							</div>

							<div className="profile__field">
								<label className="profile__label">Confirm password</label>
								<input
									className="profile__input"
									type="password"
									placeholder="••••••••"
									value={passwordData.confirmPassword}
									onChange={(e) =>
										setPasswordData({ ...passwordData, confirmPassword: e.target.value })
									}
									required
								/>
							</div>

							  {passwordError && <p className="profile__error">{passwordError}</p>}
							  {passwordStatus && <p className="profile__success">{passwordStatus}</p>}

							<button className="profile__submit" type="submit" disabled={passwordLoading}>
								{passwordLoading ? "Updating…" : "Update password"}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default Profile;

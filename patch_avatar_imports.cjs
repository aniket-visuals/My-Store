const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf-8');

code = code.replace(/import \{ formatDescription \} from "\.\.\/utils";/, 'import { formatDescription, getProfileAvatarUrl } from "../utils";');

// In newReviewItem, use local avatar logic
const avatarLogic = `
    const selectedAvatarKey = localStorage.getItem("profile_selected_avatar");
    const localAvatarUrl = getProfileAvatarUrl(selectedAvatarKey);
    const finalAvatar = localAvatarUrl || currentUser.photoURL || "https://res.cloudinary.com/df5rgwdng/image/upload/v1780754431/bd0c7c0d-f709-453d-9227-298947b772d9-modified_f3lhy1.png";

    const newReviewItem = {
`;

code = code.replace(/const newReviewItem = \{/, avatarLogic);

// Replace avatar inside newReviewItem definition
code = code.replace(/avatar: currentUser\.photoURL \|\| "https:\/\/res\.cloudinary\.com\/df5rgwdng\/image\/upload\/v1780754431\/bd0c7c0d-f709-453d-9227-298947b772d9-modified_f3lhy1\.png",/, 'avatar: finalAvatar,');

// Modify the map in ProductDetailPage to correctly display avatar.
// Previously I patched this map. Let's find it.
// We need to change the displayAvatar logic.
// const displayAvatar = isCurrentUserReview ? currentUser.photoURL : (hasGenericAvatar ? null : rev.avatar);
// To use local selection if available.
const newDisplayAvatarLogic = `
                  const selectedAvatarKey = localStorage.getItem("profile_selected_avatar");
                  const localAvatarUrl = isCurrentUserReview ? getProfileAvatarUrl(selectedAvatarKey) : null;
                  const displayAvatar = isCurrentUserReview ? (localAvatarUrl || currentUser.photoURL) : (hasGenericAvatar ? null : rev.avatar);
`;

code = code.replace(/const displayAvatar = isCurrentUserReview \? currentUser\.photoURL : \(hasGenericAvatar \? null : rev\.avatar\);/, newDisplayAvatarLogic);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);

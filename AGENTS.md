<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Folder Structure Reference

```
nakshatra-astrologer/
├── app/
│   ├── (auth)/                     # Auth routes (login, register, OTP)
│   └── (dashboard)/                # Authenticated dashboard routes
│       ├── layout.jsx              # Dashboard shell with sidebar/topbar
│       ├── page.jsx                # Dashboard home
│       ├── blogs/
│       │   ├── page.jsx            # Blog list — fetches GET /api/astrologer/get-blogs
│       │   └── add/
│       │       └── page.jsx        # Add/Edit blog — uploads image to S3, calls POST /api/astrologer/create-blog
│       ├── offers/
│       │   ├── page.jsx            # Offer list — edit/delete inline
│       │   └── new/
│       │       └── page.jsx        # Create/Edit offer
│       ├── sessions/
│       │   └── page.jsx            # Sessions list with pagination
│       ├── session-details/
│       ├── payout-history/
│       ├── review-ratings/
│       ├── kyc-details/
│       ├── notifications/
│       ├── settings/
│       ├── help-support/
│       └── change-language/
│
├── components/                     # Shared UI components
├── constants/
│   ├── apiConstants.js             # BASE_URL + API_ENDPOINTS map
│   └── others.js                   # AUTH_TOKEN_KEY, LOGOUT_EVENT, etc.
│
├── lib/
│   ├── axiosInstance.js            # `api` (no auth) + `apiAUTH` (with Bearer token)
│   ├── apiServices.js              # getAPIAuth, postAPIAuth, deleteAPIAuth, patchAPIAuth, formDataAuth
│   ├── getBackendImageUrl.js       # Resolves relative S3 paths → full CDN URL
│   ├── uploadToS3.js               # Direct S3 PUT upload → returns S3 key string
│   ├── clientHelpers.js            # getCookie / removeCookie
│   ├── events.js                   # EventEmitter for logout bus
│   └── socket.js                   # Socket.io client singleton
│
├── redux/
│   ├── store.js
│   └── slices/
│       ├── dashboardSlice.js       # All dashboard async thunks + state
│       │   Thunks: fetchDashboardProfile, fetchDashboardAnalytics, fetchDailyStats,
│       │           fetchPayoutHistory, fetchPendingChatRequests, fetchAstrologerReviews,
│       │           fetchSessions, fetchSessionDetail,
│       │           addOffer, editOffer, fetchOffers, deleteOffer,
│       │           fetchBlogs, createBlog, deleteBlog,
│       │           updateOnlineStatus, updateAstrologerServices
│       └── notificationSlice.js
│
├── i18n/                           # i18next + react-i18next setup
├── public/                         # Static assets
│
├── .env                            # NEXT_PUBLIC_IMAGE_CDN_URL, AWS_*, NEXT_PUBLIC_AWS_*
├── next.config.mjs
└── AGENTS.md                       # ← you are here
```

## Key Patterns

### API Calls
- **Authenticated**: use `getAPIAuth(url)`, `postAPIAuth(url, payload)`, `deleteAPIAuth(url)`, `patchAPIAuth(url, data)` from `@/lib/apiServices`
- **Unauthenticated**: use `getAPI`, `postAPI`
- All thunks live in `redux/slices/dashboardSlice.js` and are dispatched with `useDispatch()`

### Image Handling
- Display: `getBackendImageUrl(relativePath)` → full S3/CDN URL
- Upload (browser→S3): Direct PUT to `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
  - Key format: `astrologerimages/image-{timestamp}-{random}.{ext}`
  - Pass the **key** (not full URL) in API payloads (e.g. `image: "astrologerimages/image-....jpg"`)

### Auth Token
- Stored as a cookie under `AUTH_TOKEN_KEY` (see `constants/others.js`)
- `apiAUTH` interceptor auto-injects `Authorization: Bearer <token>`
- 401/403-astrologer-not-found responses auto-trigger logout

### Toast Notifications
- Use `react-hot-toast`: `toast.success(msg)` / `toast.error(msg)`
 
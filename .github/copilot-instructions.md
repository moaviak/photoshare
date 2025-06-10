# 📁 Photoshare Project Structure (MERN + TypeScript)

```
/photoshare
├── frontend/                # React + TS frontend
│   └── src/
│       ├── assets/         # Images and static files
│       ├── components/     # Reusable UI components
│       ├── features/       # Feature-based structure
│       ├── layouts/        # Layout components
│       ├── pages/          # Page-level routes
│       ├── routes/         # Routing logic (if applicable)
│       ├── theme/          # Chakra & Tailwind config
│       ├── types/          # Global TypeScript types
│       ├── utils/          # Helper functions
│       └── hooks/          # Custom hooks (zustand, react-query)
│
├── src/                    # Backend (Node.js + Express + Appwrite)
│   ├── controllers/        # Route handlers
│   ├── middlewares/        # Auth, error handling, etc.
│   ├── routes/             # Express route definitions
│   ├── services/           # Appwrite SDK, logic for auth/files/db
│   ├── utils/              # Utility functions (validators, logger)
│   ├── config/             # Appwrite + Multer config
│   ├── constants/          # App-wide constants/enums
│   └── index.ts            # App entry point
│
├── .env                    # Environment variables
├── package.json            # Project metadata
└── tsconfig.json           # TypeScript config
```

---

# ✅ Backend Best Practices (Node.js + Express + Appwrite)

## ✨ General

- Use **TypeScript** with type-safe Express routes
- Use **ESModules** (`type: module`) or keep to CommonJS consistently
- Keep `index.ts` clean — only for app startup/config
- Use `.env` for Appwrite keys and secrets

## 🔐 Authentication & Access Control

- Store `accountId`, `email`, `role` in a `User` collection
- Validate Appwrite JWT in middleware (on protected routes)
- Role-based access checks:
  - Creator can upload/update/delete posts
  - Consumer can like/comment/save

## 🧱 Controller Patterns

Each controller should:

- Validate inputs (e.g., using Zod or custom validators)
- Interact with Appwrite SDK via services
- Return consistent JSON response format `{ success, data, error }`

```ts
export const uploadPost = async (req: Request, res: Response) => {
  try {
    const { caption, location } = req.body;
    const file = req.file;
    // Validate
    if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const post = await postService.createPost({ ... });
    return res.status(201).json({ success: true, data: post });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
```

## 🗃 Appwrite Integration

- Use Appwrite SDK to handle:
  - `account.createJWT()` for session validation
  - `databases.createDocument()` for posts, comments, users
  - `storage.createFile()` to upload photos (after multer)
- Use structured collections:
  - `users`: accountId, name, email, role, joinedAt
  - `posts`: title, caption, imageUrl, tags, ratings, createdBy
  - `comments`: postId, authorId, text, createdAt
  - `ratings`: postId, score, userId

## 🧾 Multer File Handling

- Use `multer.memoryStorage()` for streaming directly to Appwrite
- Add file filters (MIME type + size limit ~5MB)

```ts
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    cb(null, isImage);
  },
});
```

## 🔄 Services Layer

- Separate all Appwrite logic from controllers
- Group SDK usage per entity: `userService`, `postService`, `commentService`

## 🧪 Testing & Validation

- Use Postman or Thunder Client for testing APIs
- Create reusable error handler middleware
- Add basic logging for failed ops (custom logger or `console.log`)

---

# ✅ Frontend Best Practices (React + Chakra UI + Tailwind + Zustand + React Query)

## 🧱 Component Structure

- Use `components/ui/` for reusable atomic UI pieces
- Use `features/[feature]/components` for domain-specific UIs
- Use Chakra UI for consistent UI layout
- Use Tailwind for utility-first customization

## 💡 Zustand State Management

- Keep one store per domain feature
- Export actions separately from the store
- Keep UI state separate from business logic

```ts
export const useUploadStore = create((set) => ({
  isUploading: false,
  setUploading: (val: boolean) => set({ isUploading: val }),
}));
```

## 🔄 React Query for Async State

- Use `useQuery` for GET and `useMutation` for POST/PUT/DELETE
- Centralize API logic under `/utils/api.ts`
- Use `queryClient.invalidateQueries()` after mutations

## 🧩 Tailwind + Chakra Combo

- Define global Chakra theme overrides under `theme/`
- Use Chakra layout components (`Box`, `Flex`, etc.)
- Use Tailwind for quick adjustments (`mt-4`, `px-6`, etc.)
- Avoid CSS-in-JS unless needed for conditional logic

## 🧼 Code Guidelines

- Max 150 lines per component
- Props ≤ 7 values; use objects if more
- Group related hooks and handlers at the top
- Use `.tsx` for all components, `.ts` for utilities and hooks

## 🧪 Testing & Dev Tools

- Use React DevTools + Zustand DevTools for state inspection
- Write testable utilities and pure functions
- Use TypeScript for prop interfaces and store shape enforcement

---

Would you like to add Docker, CI/CD or deployment workflow next?

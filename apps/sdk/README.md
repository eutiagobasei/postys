# Postys NodeJS SDK

This is the NodeJS SDK for [Postys](https://postys.io).

You can start by installing the package:

```bash
npm install @postys/node
```

## Usage
```typescript
import Postys from '@postys/node';
const postys = new Postys('your api key', 'your self-hosted instance (optional)');
```

The available methods are:
- `post(posts: CreatePostDto)` - Schedule a post to Postys
- `postList(filters: GetPostsDto)` - Get a list of posts
- `upload(file: Buffer, extension: string)` - Upload a file to Postys
- `integrations()` - Get a list of connected channels
- `deletePost(id: string)` - Delete a post by ID

Alternatively you can use the SDK with curl, check the [Postys API documentation](https://docs.postys.io/public-api) for more information.
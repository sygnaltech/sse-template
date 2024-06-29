# Setup

See the official SSE docs here- 
https://engine.sygnal.com/

## package.json

Edit name and version

## index.ts

Edit `SITE_NAME` and `VERSION`. 


## Integration

Site-wide - before HTML

Replace REPO, handle as desired

```
<!-- Site engine -->
<script 
  src="https://cdn.jsdelivr.net/gh/sygnaltech/REPO@0.1.0/dist/init.js" 
  dev-src="http://127.0.0.1:3000/dist/index.js"
  ></script>
```

```
<!-- Site engine -->
<script 
  src="https://cdn.jsdelivr.net/gh/sygnaltech/REPO@0.1.0/dist/index.js" 
  dev-src="http://127.0.0.1:3000/dist/index.js"
  ></script>
```

```
<!-- Site engine -->
<script 
  src="http://127.0.0.1:3000/dist/init.js" 
  dev-src="http://127.0.0.1:3000/dist/index.js"
  ></script>
```

# Testing

Test Project

https://webflow.com/dashboard/sites/sygnal-site-engine/general
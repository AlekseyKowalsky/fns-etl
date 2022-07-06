# rosanketa

## Accessing to preview

- http://beta.rosanketa.com/
- http://rosanketa.com/

## Running the entire project locally

Build and start using docker:

```
docker compose build
docker compose up
```

## Deploy
# production release:
- create release folow this schema:
    - `Tag version` v*
    - `Release title` same as in tag version
    - `Describe release` 
        - RAN-*
        - RAN-*
        - ...
    - example:
        - v1.0.0
        - v1.0.0
        - RAN-116 Сделать production deploy на digital ocean
- _after the release has been created, the deployment will start automatically_
        
# beta deploy:       
- create release folow this schema:
    - `Tag version` beta-v(version future production release)_(version beta deploy, in other words - cannary release)
    - `Release title` same as in tag version
    - `Describe release` 
        - RAN-*
        - RAN-*
        - ...
    - example:
        - beta-v1.0.0_1
        - beta-v1.0.0_1
        - RAN-116 Сделать production deploy на digital ocean
- _after the release has been created, the deployment will start automatically_

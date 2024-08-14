FROM mcr.microsoft.com/dotnet/sdk:8.0-bookworm-slim AS build

WORKDIR /sln

COPY ./OutlineManager.sln ./
COPY ./Client/*.csproj ./Client/

RUN dotnet restore

COPY . .

RUN dotnet build -c Release

FROM build AS publish
RUN dotnet publish ./Client/Client.csproj -c Release -o /app/publish

FROM nginx:alpine AS final

WORKDIR /usr/share/nginx/html
COPY --from=publish /app/publish/wwwroot .

COPY ./nginx.conf /etc/nginx/nginx.conf

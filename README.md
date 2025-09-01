# HomeScout — Address Intelligence API (Java/Maven)

Java/Maven service that accepts a street **address** and returns **home-related factors** such as school rating, crime indicators, walkability, income and demographic context, and more.

> ⚠️ **Data disclaimer:** Outputs depend on the data providers you connect (see **Configuration → Data providers**). Figures are estimates for research only and not financial, legal, or safety advice.

---

## Features

* 🔎 **Single endpoint** to look up an address → returns a normalized JSON payload
* 🏫 **School context:** rating/score (0–10), nearest schools, links (provider-dependent)
* 🚔 **Crime context:** relative index or per‑capita counts (provider-dependent)
* 🚶 **Walkability/bike/transit** indicators when APIs are available
* 💵 **Income & demographics** from public datasets (e.g., US Census/ACS)
* 📍 **Geocoding**: converts address → lat/lng (primary + fallback providers)
* ⚡ Optional **caching** & **rate limiting**
* 🗄️ Pluggable persistence (PostgreSQL or MongoDB) — optional

---

## Tech stack

* Java 17+ (LTS recommended)
* Maven 3.9+
* Spring Boot (Web, Validation, Actuator)
* Jackson (JSON), SLF4J/Logback (logging)
* Optional: Spring Data JPA (PostgreSQL) or Spring Data MongoDB (MongoDB)

---

## Quick start

```bash
# 1) Clone
git clone https://github.com/<you>/<repo>.git
cd <repo>

# 2) Configure env
cp .env.example .env
# edit .env with your API keys / DB connection (see below)

# 3) Run
mvn spring-boot:run
# or build a jar
mvn clean package && java -jar target/homescout-*.jar
```

Service will start (by default) on `http://localhost:8080`.

---

## Configuration

### Environment variables (`.env` or system env)

Provide whatever providers you plan to use; leave others unset.

```properties
# Server
SERVER_PORT=8080

# Geocoding (choose one or more)
GEOCODER_PRIMARY=google    # google|mapbox|osm
GEOCODER_GOOGLE_KEY=
GEOCODER_MAPBOX_TOKEN=
# OSM/Nominatim often does not need a key but requires a unique User-Agent/email
GEOCODER_OSM_EMAIL=

# School data (examples—pick your provider)
SCHOOLS_PROVIDER=greatschools  # greatschools|niche|none
SCHOOLS_API_KEY=

# Crime data
CRIME_PROVIDER=fbi              # fbi|opendata|none
CRIME_API_KEY=

# Walkability
WALKSCORE_API_KEY=

# Census/ACS
CENSUS_API_KEY=

# Optional DB (choose ONE)
DB_VENDOR=postgres              # postgres|mongodb|none
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/homescout
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
# Mongo example:
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/homescout

# Caching / rate limiting (optional)
CACHE_TTL_SECONDS=3600
RATE_LIMIT_PER_MINUTE=60
```

> **Note:** Some providers (e.g., GreatSchools) restrict API access; you may need approval. For crime and school data, you can also plug in city/county open data sets.

### Application configuration

* `src/main/resources/application.yml` reads from environment variables shown above.
* If you prefer properties files, keep `application.properties` instead.

---

## API

### `GET /api/factors`

Look up an address and return a normalized set of factors.

**Query params**

* `address` (required): full street address string

**Example**

```
GET /api/factors?address=2952%20W%20Lincoln%20Ave,%20Anaheim,%20CA%2092801
```

**Response (example)**

```json
{
  "query": {
    "address": "2952 W Lincoln Ave, Anaheim, CA 92801"
  },
  "location": {
    "latitude": 33.8182,
    "longitude": -117.9736,
    "formatted": "2952 W Lincoln Ave, Anaheim, CA 92801",
    "geocoder": "google"
  },
  "scores": {
    "school": { "value": 7.8, "scale": 10, "provider": "greatschools", "notes": "Composite score" },
    "crime": { "index": 0.62, "baseline": "national=1.0", "provider": "fbi" },
    "walk": { "walkScore": 71, "bikeScore": 63, "transitScore": 48, "provider": "walkscore" }
  },
  "context": {
    "income": { "median_household": 84200, "provider": "census" },
    "demographics": {
      "population": 42300,
      "age_median": 34.6,
      "race_ethnicity": { "white": 0.38, "asian": 0.29, "hispanic": 0.27, "black": 0.04, "other": 0.02 },
      "provider": "census"
    }
  },
  "metadata": {
    "generated_at": "2025-08-31T19:55:00Z",
    "cache": false
  }
}
```

**Errors**

```json
{
  "error": {
    "code": "ADDRESS_NOT_FOUND",
    "message": "Geocoder could not resolve the provided address."
  }
}
```

---

## Project layout (suggested)

```
src/
 └─ main/
     ├─ java/com/yourorg/homescout/
     │   ├─ api/        # Controllers / DTOs
     │   ├─ service/    # Orchestration / caching / validation
     │   ├─ provider/   # Integrations (geocoding, schools, crime, walkability, census)
     │   ├─ model/      # Domain models
     │   ├─ repo/       # JPA/Mongo repositories (optional)
     │   └─ config/     # Spring @Configuration
     └─ resources/
         ├─ application.yml
         └─ static/ (if needed)
```

---

## Development

* **Run:** `mvn spring-boot:run`
* **Test:** `mvn test`
* **Format/Lint:** add Spotless/Checkstyle if desired
* **Profiles:** use Spring profiles like `dev`, `prod` to switch providers/keys

### Docker (optional)

```bash
# build image
mvn -DskipTests spring-boot:build-image
# or with Dockerfile (if present)
# docker build -t homescout:latest .

docker run --rm -p 8080:8080 --env-file .env homescout:latest
```

---

## Data providers (examples)

* **Geocoding:** Google Maps, Mapbox, OSM/Nominatim
* **School ratings:** GreatSchools (partner), Niche, district/state open data
* **Crime:** FBI Crime Data API, city/county open data portals
* **Walkability:** Walk Score API
* **Income/Demographics:** US Census/ACS

> Replace or extend these with providers appropriate to your region. Normalize units and include `provider` in your JSON for transparency.

---

## Security & privacy

* Do not log raw API keys or full PII; mask sensitive fields
* Rate-limit public endpoints; cache responses per-address
* Respect third‑party API Terms of Service

---

## Roadmap

* ✅ Address → factors MVP (this repo)
* ⏭️ Confidence scores per provider & per factor
* ⏭️ Batch lookup & CSV export
* ⏭️ Persistence layer (Postgres/Mongo) with historical snapshots
* ⏭️ GraphQL endpoint
* ⏭️ Frontend integration (`homescout-web`)

---

## Contributing

PRs welcome! Please open an issue describing the change first. Add tests for new code paths.

---

## License

MIT (or choose your preferred license).

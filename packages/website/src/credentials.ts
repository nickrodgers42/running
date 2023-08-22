const CREDENTIALS_KEY = "CREDENTIALS"

export class Credentials {
  private accessToken: string
  private refreshToken: string
  private expiresAt: Date

  constructor(accessToken: string, refreshToken: string, expiresAt: number | Date) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    if (typeof expiresAt === "number") {
      this.expiresAt = new Date(expiresAt)
    }
    else {
      this.expiresAt = expiresAt
    }
  }

  public static hasStoredCredentials(): boolean {
    return localStorage.getItem(CREDENTIALS_KEY) === null
  }

  public static getCredentials(): Credentials {
    const credsString = localStorage.getItem(CREDENTIALS_KEY)
    if (credsString === null) {
      throw new Error("No credentials found")
    }
    const credsObject = JSON.parse(credsString)

    return new Credentials(credsObject.accessToken, credsObject.refreshToken, credsObject.expiresAt)
  }

  public storeCredentials(): void {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt
    }))
  }

  public refreshAccessToken(): void {}

  public areCredentialsExpired(): boolean {
    return new Date() < this.expiresAt
  }
}

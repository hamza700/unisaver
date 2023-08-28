import { BankingService } from './../banking/banking.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  ItemPublicTokenExchangeRequest,
  ItemPublicTokenExchangeResponse,
  LinkTokenCreateRequest,
  Products,
  AccountSubtype,
  CountryCode,
  DepositoryAccountSubtype,
  SandboxPublicTokenCreateRequest,
  LinkTokenCreateResponse,
  AuthGetResponse,
  Transaction,
  AccountBalance,
  AccountsGetResponse,
  ItemGetResponse,
  IdentityGetResponse,
} from 'plaid';
import { GetUser } from '../auth/get-user-decorator';
import { User } from '../auth/user.entity';

@Injectable()
export class PlaidService {
  private logger = new Logger('PlaidService');

  private plaidClient: PlaidApi;

  constructor(
    private configService: ConfigService,
    private bankingService: BankingService,
  ) {
    const plaidConfig: Configuration = new Configuration({
      basePath: this.configService.get<string>('PLAID_BASE_PATH'),
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': this.configService.get<string>('PLAID_CLIENT_ID'),
          'PLAID-SECRET': this.configService.get<string>('PLAID_SECRET'),
        },
      },
    });

    this.plaidClient = new PlaidApi(plaidConfig);
  }

  async createLinkToken(
    @GetUser() user: User,
  ): Promise<LinkTokenCreateResponse> {
    const clientUserId = user.id;

    const request: LinkTokenCreateRequest = {
      user: {
        client_user_id: clientUserId,
      },
      client_name: 'UniSaver App',
      products: [Products.Auth, Products.Transactions, Products.Identity],
      country_codes: [CountryCode.Gb],
      language: 'en',
      // webhook: 'https://sample-web-hook.com',
      // redirect_uri: 'https://domainname.com/oauth-page.html',
      account_filters: {
        depository: {
          account_subtypes: [
            DepositoryAccountSubtype.Checking,
            DepositoryAccountSubtype.Savings,
          ],
        },
      },
    };

    try {
      const createTokenResponse = await this.plaidClient.linkTokenCreate(
        request,
      );
      return createTokenResponse.data;
    } catch (error) {
      console.error('Error creating link token:', error);

      throw new Error('Error creating link token');
    }
  }

  async setAccessToken(publicToken: string): Promise<object> {
    try {
      const tokenResponse = await this.plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = tokenResponse.data.access_token;
      const itemId = tokenResponse.data.item_id;

      // Implement authorizeAndCreateTransfer function here if needed

      return {
        access_token: accessToken,
        item_id: itemId,
        error: null,
      };
    } catch (error) {
      // Handle errors and return appropriate response
      throw new Error('Failed to set access token');
    }
  }

  async getAuth(user: User): Promise<AuthGetResponse> {
    const accessTokens = await this.bankingService.getAccessTokens(user);
    const firstAccessToken = accessTokens[0];

    try {
      const authResponse = await this.plaidClient.authGet({
        access_token: firstAccessToken,
      });

      return authResponse.data;
    } catch (error) {
      this.logger.error('Error fetching auth data', error);
      throw error;
    }
  }

  async getTransactions(user: User): Promise<Transaction[]> {
    const accessToken = await this.bankingService.getAccessTokens(user);
    const firstAccessToken = accessToken[0];

    const transactions: Transaction[] = [];

    try {
      let cursor = null;
      let hasMore = true;

      while (hasMore) {
        const request = {
          access_token: firstAccessToken,
          cursor: cursor,
        };

        const response = await this.plaidClient.transactionsSync(request);
        const data = response.data;

        transactions.push(...data.added);

        hasMore = data.has_more;
        cursor = data.next_cursor;
      }

      const compareTxnsByDateAscending = (a, b) => a.date.localeCompare(b.date);
      const recentlyAdded = transactions
        .sort(compareTxnsByDateAscending)
        .slice(-8);

      return recentlyAdded;
    } catch (error) {
      this.logger.error('Error fetching recent transactions', error);
      throw error;
    }
  }

  async getBalances(user: User): Promise<AccountsGetResponse> {
    const accessToken = await this.bankingService.getAccessTokens(user);
    const firstAccessToken = accessToken[0];
    if (!accessToken) {
      throw new NotFoundException('Access token not found');
    }

    const balanceResponse = await this.plaidClient.accountsBalanceGet({
      access_token: firstAccessToken,
    });

    // Process the balanceResponse and save it to the bankCard entity
    // You can decide how you want to structure and save the balance data
    // ...

    return balanceResponse.data;
  }

  async getItemInfo(user: User): Promise<any> {
    const accessToken = await this.bankingService.getAccessTokens(user);
    const firstAccessToken = accessToken[0];
    if (!accessToken) {
      throw new NotFoundException('Access token not found');
    }

    const itemResponse = await this.plaidClient.itemGet({
      access_token: firstAccessToken,
    });

    const configs = {
      institution_id: itemResponse.data.item.institution_id,
      country_codes: [CountryCode.Gb],
    };
    const instResponse = await this.plaidClient.institutionsGetById(configs);

    return {
      itemResponse,
      instResponse,
    };
  }

  async getAccounts(user: User): Promise<AccountsGetResponse> {
    const accessToken = await this.bankingService.getAccessTokens(user);
    const firstAccessToken = accessToken[0];

    const accountsResponse = await this.plaidClient.accountsGet({
      access_token: firstAccessToken,
    });
    return accountsResponse.data;
  }

  async getIdentity(user: User): Promise<any> {
    const accessToken = await this.bankingService.getAccessTokens(user);
    const firstAccessToken = accessToken[0];
    try {
      const identityResponse = await this.plaidClient.identityGet({
        access_token: firstAccessToken,
      });

      return identityResponse;
    } catch (error) {
      this.logger.error('Error fetching identity data', error);
      throw error;
    }
  }
}

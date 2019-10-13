import React from 'react';
import Head from 'next/head';
import { Provider as ReduxProvider } from 'react-redux';
import App from 'next/app';
import withReduxStore from '@sideroad/with-redux-store';
import Fetcher from '@sideroad/redux-fetch';
import { init, Provider as I18nProvider, Headers } from '@sideroad/react-i18n';
import initializeStore from 'reducers/index';
import { Provider as ContextProvider } from '../helpers/context';
import urls from '../urls';
import locales, { fallbackLanguage } from '../locales';
import { Store } from 'types/redux';
import config from '../config';
import mock from '../helpers/mock';

interface Props {
  headers: Headers;
  store: Store;
  lang: string | undefined;
}

class MyApp extends App<Props> {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    const headers = ctx.req
      ? {
          'user-agent': ctx.req.headers['user-agent'],
          cookie: ctx.req.headers.cookie
        }
      : {};
    const fetcher = new Fetcher({
      headers,
      dispatch: ctx.store.dispatch,
      urls,
      mocks: config.isMocked ? mock() : undefined
    });

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ...ctx, fetcher });
    }
    return {
      pageProps,
      headers: ctx.req ? ctx.req.headers : undefined,
      lang: ctx.query.lang
    };
  }

  render() {
    const { Component, pageProps, store, headers, lang } = this.props;

    const i18n = init({
      headers,
      locales,
      fallbackLanguage,
      assignedLanguage: lang
    });

    const fetcher = new Fetcher({
      dispatch: store.dispatch,
      urls,
      headers,
      mocks: config.isMocked ? mock() : undefined
    });
    return (
      <I18nProvider value={i18n}>
        <ContextProvider
          value={{
            fetcher
          }}
        >
          <ReduxProvider store={store}>
            <Head>
              <title>{config.meta.title}</title>
            </Head>
            <Component {...pageProps} />
            <style jsx global>
              {`
                body,
                button,
                input {
                  margin: 0;
                  font-family: -apple-system, Avenir Next, Avenir, Helvetica,
                    sans-serif;
                }
              `}
            </style>
          </ReduxProvider>
        </ContextProvider>
      </I18nProvider>
    );
  }
}

export default withReduxStore(MyApp, initializeStore);

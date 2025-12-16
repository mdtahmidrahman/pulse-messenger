import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import ChatLayout from '@/Layouts/ChatLayout.jsx';

function Home() {
    return <>Messages</>;
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};

export default Home;

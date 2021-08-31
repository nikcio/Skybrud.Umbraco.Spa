using Skybrud.Umbraco.Spa.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

#pragma warning disable 1591

namespace Skybrud.Umbraco.Spa.Components
{
    public class SpaCacheComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddNotificationHandler<ContentSavingNotification, SpaCacheNotificationHandler>();
            builder.AddNotificationHandler<ContentMovingToRecycleBinNotification, SpaCacheNotificationHandler>();
            builder.AddNotificationHandler<ContentUnpublishingNotification, SpaCacheNotificationHandler>();
        }
    }

    public class SpaCacheNotificationHandler : INotificationHandler<ContentSavingNotification>, INotificationHandler<ContentMovingToRecycleBinNotification>, INotificationHandler<ContentUnpublishingNotification>
    {
        private readonly ISpaCacheService _cacheService;

        public SpaCacheNotificationHandler(ISpaCacheService cacheService) {
            _cacheService = cacheService;
        }

        public void Handle(ContentSavingNotification notification)
        {
            _cacheService.ClearAll();
        }

        public void Handle(ContentMovingToRecycleBinNotification notification)
        {
            _cacheService.ClearAll();
        }

        public void Handle(ContentUnpublishingNotification notification)
        {
            _cacheService.ClearAll();
        }
    }

}
using Microsoft.Extensions.DependencyInjection;
using Skybrud.Umbraco.Spa.Repositories;
using Skybrud.Umbraco.Spa.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

#pragma warning disable 1591

namespace Skybrud.Umbraco.Spa.Composers
{

    public class SpaComposer : IComposer {

        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddSingleton<ISpaCacheService, SpaCacheService>();
            builder.Services.AddUnique<SpaDomainRepository>();
        }
    }

}
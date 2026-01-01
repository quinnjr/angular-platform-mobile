Pod::Spec.new do |s|
  s.name             = 'AngularMobile'
  s.version          = '0.1.0'
  s.summary          = 'Native iOS runtime for Angular Platform Mobile'
  s.description      = <<-DESC
    Angular Mobile provides the native iOS runtime for Angular Platform Mobile,
    enabling developers to build truly native iOS applications using Angular.
  DESC

  s.homepage         = 'https://github.com/PegasusHeavyIndustries/angular-platform-mobile'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'Pegasus Heavy Industries' => 'dev@pegasusheavy.com' }
  s.source           = { :git => 'https://github.com/PegasusHeavyIndustries/angular-platform-mobile.git', :tag => s.version.to_s }

  s.ios.deployment_target = '15.0'
  s.swift_version = '5.9'

  s.source_files = 'AngularMobile/Sources/**/*'

  s.frameworks = 'UIKit', 'WebKit', 'Foundation'
end

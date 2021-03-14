<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * UserTable
 *
 * @ORM\Table(name="Users.User_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Username_UNIQUE", columns={"Username"}), @ORM\UniqueConstraint(name="User ID_UNIQUE", columns={"User_ID"}), @ORM\UniqueConstraint(name="Email Address_UNIQUE", columns={"Email_Address"})}, indexes={@ORM\Index(name="fk_User_Table_Style_Groups1_idx", columns={"Style_ID"}), @ORM\Index(name="fk_User_Table_Language_Table1_idx", columns={"Language_ID"})})
 * @UniqueEntity(fields="emailAddress", message="Email already taken")
 * @UniqueEntity(fields="username", message="Username already taken")
 * @ORM\Entity
 */
class UserTable implements UserInterface
{
    /**
     * @var string
     *
     * @ORM\Column(name="Username", type="string", length=45, nullable=false)
     */
    private $username;

    /**
     * @var string
     *
     * @ORM\Column(name="Email_Address", type="string", length=45, nullable=false)
     */
    private $emailAddress;

    /**
     * @var string
     *
     * @ORM\Column(name="PassCheck", type="string", length=256, nullable=false)
     */
    private $passcheck;

    /**
     * @Assert\NotBlank()
     * @Assert\Length(max = 255)
     */
    private $plainPassword;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_Added", type="datetime", nullable=false)
     */
    private $dateAdded;

    /**
     * @var string
     *
     * @ORM\Column(name="First_Name", type="string", length=45, nullable=false)
     */
    private $firstName;

    /**
     * @var string
     *
     * @ORM\Column(name="Last_Name", type="string", length=45, nullable=false)
     */
    private $lastName;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_of_Birth", type="datetime", nullable=false)
     */
    private $dateOfBirth;

    /**
     * @var boolean
     *
     * @ORM\Column(name="isAuthenticated", type="boolean", nullable=false)
     */
    private $isauthenticated = '0';

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Last_Login", type="datetime", nullable=true)
     */
    private $lastLogin;

    /**
     * @var integer
     *
     * @ORM\Column(name="User_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $userId;

    /**
     * @var \App\Entity\LanguageTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\LanguageTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Language_ID", referencedColumnName="Language_ID")
     * })
     */
    private $language;

    /**
     * @var \App\Entity\StyleGroups
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\StyleGroups")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Style_ID", referencedColumnName="Style_ID")
     * })
     */
    private $style;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\ManyToMany(targetEntity="App\Entity\StudyFieldTable", inversedBy="user")
     * @ORM\JoinTable(name="user_study_fields",
     *   joinColumns={
     *     @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     *   },
     *   inverseJoinColumns={
     *     @ORM\JoinColumn(name="Field_ID", referencedColumnName="Field_ID")
     *   }
     * )
     */
    private $field;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\ManyToMany(targetEntity="App\Entity\InterestTable", inversedBy="user")
     * @ORM\JoinTable(name="user_interest_links",
     *   joinColumns={
     *     @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     *   },
     *   inverseJoinColumns={
     *     @ORM\JoinColumn(name="Interest_ID", referencedColumnName="Interest_ID")
     *   }
     * )
     */
    private $interest;

    /**
     * @var \App\Entity\JoinWait
     *
     * @ORM\OneToOne(targetEntity="App\Entity\JoinWait", mappedBy="user")
     */
    private $waitingJoin;


    /**
     * Constructor
     */
    public function __construct($userStyle, $userLang)
    {
        $this->field = new \Doctrine\Common\Collections\ArrayCollection();
        $this->interest = new \Doctrine\Common\Collections\ArrayCollection();
        $this->dateAdded = new \DateTime("now");
        $this->style = $userStyle;
        $this->language = $userLang;
    }


    /**
     * Set username
     *
     * @param string $username
     *
     * @return UserTable
     */
    public function setUsername($username)
    {
        $this->username = $username;

        return $this;
    }

    /**
     * Get username
     *
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * Set emailAddress
     *
     * @param string $emailAddress
     *
     * @return UserTable
     */
    public function setEmailAddress($emailAddress)
    {
        $this->emailAddress = $emailAddress;

        return $this;
    }

    /**
     * Get emailAddress
     *
     * @return string
     */
    public function getEmailAddress()
    {
        return $this->emailAddress;
    }

    /**
     * Set passcheck
     *
     * @param string $passcheck
     *
     * @return UserTable
     */
    public function setPasscheck($passcheck)
    {
        $this->passcheck = $passcheck;

        return $this;
    }

    /**
     * Get passcheck
     *
     * @return string
     */
    public function getPasscheck()
    {
        return $this->passcheck;
    }

    public function getPlainPassword()
    {
        return $this->plainPassword;
    }

    public function setPlainPassword($password)
    {
        $this->plainPassword = $password;
    }

    public function setPassword($password)
    {
        $this->passcheck = $password;
    }

    public function getPassword()
    {
        return $this->passcheck;
    }

    public function getRoles()
    {
        return array('ROLE_USER');
    }

    public function getSalt()
    {
        return null;
    }

    public function eraseCredentials()
    {
    }

    /**
     * Set dateAdded
     *
     * @param \DateTime $dateAdded
     *
     * @return UserTable
     */
    public function setDateAdded($dateAdded)
    {
        $this->dateAdded = $dateAdded;

        return $this;
    }

    /**
     * Get dateAdded
     *
     * @return \DateTime
     */
    public function getDateAdded()
    {
        return $this->dateAdded;
    }

    /**
     * Set firstName
     *
     * @param string $firstName
     *
     * @return UserTable
     */
    public function setFirstName($firstName)
    {
        $this->firstName = $firstName;

        return $this;
    }

    /**
     * Get firstName
     *
     * @return string
     */
    public function getFirstName()
    {
        return $this->firstName;
    }

    /**
     * Set lastName
     *
     * @param string $lastName
     *
     * @return UserTable
     */
    public function setLastName($lastName)
    {
        $this->lastName = $lastName;

        return $this;
    }

    /**
     * Get lastName
     *
     * @return string
     */
    public function getLastName()
    {
        return $this->lastName;
    }

    /**
     * Set dateOfBirth
     *
     * @param \DateTime $dateOfBirth
     *
     * @return UserTable
     */
    public function setDateOfBirth($dateOfBirth)
    {
        $this->dateOfBirth = $dateOfBirth;

        return $this;
    }

    /**
     * Get dateOfBirth
     *
     * @return \DateTime
     */
    public function getDateOfBirth()
    {
        return $this->dateOfBirth;
    }

    /**
     * Set isauthenticated
     *
     * @param boolean $isauthenticated
     *
     * @return UserTable
     */
    public function setIsauthenticated($isauthenticated)
    {
        $this->isauthenticated = $isauthenticated;

        return $this;
    }

    /**
     * Get isauthenticated
     *
     * @return boolean
     */
    public function getIsauthenticated()
    {
        return $this->isauthenticated;
    }

    /**
     * Set lastLogin
     *
     * @param \DateTime $lastLogin
     *
     * @return UserTable
     */
    public function setLastLogin($lastLogin)
    {
        $this->lastLogin = $lastLogin;

        return $this;
    }

    /**
     * Get lastLogin
     *
     * @return \DateTime
     */
    public function getLastLogin()
    {
        return $this->lastLogin;
    }

    /**
     * Get userId
     *
     * @return integer
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * Set language
     *
     * @param \App\Entity\LanguageTable $language
     *
     * @return UserTable
     */
    public function setLanguage(\App\Entity\LanguageTable $language = null)
    {
        $this->language = $language;

        return $this;
    }

    /**
     * Get language
     *
     * @return \App\Entity\LanguageTable
     */
    public function getLanguage()
    {
        return $this->language;
    }

    /**
     * Set style
     *
     * @param \App\Entity\StyleGroups $style
     *
     * @return UserTable
     */
    public function setStyle(\App\Entity\StyleGroups $style = null)
    {
        $this->style = $style;

        return $this;
    }

    /**
     * Get style
     *
     * @return \App\Entity\StyleGroups
     */
    public function getStyle()
    {
        return $this->style;
    }

    /**
     * Add field
     *
     * @param \App\Entity\StudyFieldTable $field
     *
     * @return UserTable
     */
    public function addField(\App\Entity\StudyFieldTable $field)
    {
        $this->field[] = $field;

        return $this;
    }

    /**
     * Remove field
     *
     * @param \App\Entity\StudyFieldTable $field
     */
    public function removeField(\App\Entity\StudyFieldTable $field)
    {
        $this->field->removeElement($field);
    }

    /**
     * Get field
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getField()
    {
        return $this->field;
    }

    /**
     * Add interest
     *
     * @param \App\Entity\InterestTable $interest
     *
     * @return UserTable
     */
    public function addInterest(\App\Entity\InterestTable $interest)
    {
        $this->interest[] = $interest;

        return $this;
    }

    /**
     * Remove interest
     *
     * @param \App\Entity\InterestTable $interest
     */
    public function removeInterest(\App\Entity\InterestTable $interest)
    {
        $this->interest->removeElement($interest);
    }

    /**
     * Get interest
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getInterest()
    {
        return $this->interest;
    }

    /** @see \Serializable::serialize() */
    public function serialize()
    {
        return serialize(array(
            $this->id,
            $this->username,
            $this->password,
        ));
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized)
    {
        list (
            $this->id,
            $this->username,
            $this->password,
        ) = unserialize($serialized);
    }

    /**
     * Set waitingJoin
     *
     * @param \App\Entity\JoinWait $waitingJoin
     *
     * @return UserTable
     */
    public function setWaitingJoin(\App\Entity\JoinWait $waitingJoin = null)
    {
        $this->waitingJoin = $waitingJoin;

        return $this;
    }

    /**
     * Get waitingJoin
     *
     * @return \App\Entity\JoinWait
     */
    public function getWaitingJoin()
    {
        return $this->waitingJoin;
    }
}
